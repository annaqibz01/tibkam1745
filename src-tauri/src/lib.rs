use serde::Serialize;
use std::fs;
use std::io::Write;
use std::process::{Command, Stdio};
use std::sync::Mutex;
use tauri::Manager;

struct PocketbaseChild(Mutex<Option<std::process::Child>>);

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Serialize)]
struct PythonPayload<'a> {
    #[serde(rename = "printerName")]
    printer_name: &'a str,
    #[serde(rename = "imageBase64")]
    image_base64: &'a str,
}

#[tauri::command]
fn get_available_printers() -> Vec<String> {
    let mut cmd = Command::new("powershell");
    cmd.arg("-Command")
        .arg("Get-Printer | Select-Object -ExpandProperty Name");

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    match cmd.output() {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout);
            stdout
                .lines()
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect()
        }
        Err(_) => vec![],
    }
}

#[tauri::command]
fn print_image_silently(
    app_handle: tauri::AppHandle,
    printer_name: String,
    image_base64: String,
) -> Result<(), String> {
    println!("🖨️ [Rust] Mengirim Gambar Base64 via STDIN ke Python Service...");

    let resource_dir = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Gagal mendapatkan jalur resource: {}", e))?;
    let printer_exe = resource_dir.join("bin/printer_service.exe");

    let python_payload = PythonPayload {
        printer_name: &printer_name,
        image_base64: &image_base64,
    };
    let json_str = serde_json::to_string(&python_payload).map_err(|e| e.to_string())?;

    let mut cmd = Command::new(printer_exe);
    cmd.stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let mut child = cmd
        .spawn()
        .map_err(|e| format!("Gagal mengeksekusi printer_service.exe: {}", e))?;

    if let Some(mut stdin) = child.stdin.take() {
        stdin
            .write_all(json_str.as_bytes())
            .map_err(|e| format!("Gagal menulis data ke STDIN: {}", e))?;
    }

    let output = child
        .wait_with_output()
        .map_err(|e| format!("Gagal menunggu respon printer: {}", e))?;

    let stdout_str = String::from_utf8_lossy(&output.stdout);
    if stdout_str.contains("SUCCESS") || output.status.success() {
        println!("✅ [Python Sidecar] Silent print gambar piksel sukses!");
        Ok(())
    } else {
        let stderr_str = String::from_utf8_lossy(&output.stderr);
        Err(format!(
            "Printer Service Error: {} | {}",
            stdout_str, stderr_str
        ))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        // 🎯 SINGLE INSTANCE CONFIGURATION
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![
            get_available_printers,
            print_image_silently
        ])
        .setup(|app| {
            #[cfg(target_os = "windows")]
            {
                let _ = Command::new("taskkill")
                    .arg("/F")
                    .arg("/IM")
                    .arg("pocketbase.exe")
                    .creation_flags(CREATE_NO_WINDOW)
                    .status();
            }

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let app_local_data = app
                .path()
                .app_local_data_dir()
                .expect("Gagal mendapatkan jalur AppData Local");

            let pb_data_dir = app_local_data.join("pb_data");
            let target_db_file = pb_data_dir.join("data.db");

            if !pb_data_dir.exists() {
                fs::create_dir_all(&pb_data_dir).expect("Gagal membuat folder pb_data di AppData");
            }

            let resource_dir = app
                .path()
                .resource_dir()
                .expect("Gagal mendapatkan jalur Resource folder");

            let pocketbase_exe = resource_dir.join("bin/pocketbase.exe");
            let template_db_file = resource_dir.join("bin/koleksi_awal.db");

            let pb_migrations_dir = if cfg!(debug_assertions) {
                std::path::PathBuf::from("../backend/pb_migrations")
            } else {
                resource_dir.join("pb_migrations")
            };

            if !target_db_file.exists() && template_db_file.exists() {
                fs::copy(&template_db_file, &target_db_file)
                    .expect("Gagal menyalin template database awal");
            }

            let mut cmd = Command::new(pocketbase_exe);
            cmd.arg("serve")
                .arg("--dir")
                .arg(pb_data_dir.to_string_lossy().as_ref())
                .arg("--migrationsDir")
                .arg(pb_migrations_dir.to_string_lossy().as_ref());

            #[cfg(target_os = "windows")]
            cmd.creation_flags(CREATE_NO_WINDOW);

            let child = cmd.spawn().expect("Gagal mengeksekusi PocketBase binary");

            app.manage(PocketbaseChild(Mutex::new(Some(child))));

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| match event {
        tauri::RunEvent::Exit => {
            if let Some(state) = app_handle.try_state::<PocketbaseChild>() {
                if let Ok(mut guard) = state.0.lock() {
                    if let Some(mut child) = guard.take() {
                        let _ = child.kill();
                    }
                }
            }
        }
        _ => {}
    });
}