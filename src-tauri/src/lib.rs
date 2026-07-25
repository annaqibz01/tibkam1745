use serde::Serialize;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
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

// 📦 [PURE NATIVE AUTO-BACKUP] Menyalin data.db langsung ke Documents/Tibkam1745_Backups
#[tauri::command]
fn execute_native_auto_backup(app_handle: tauri::AppHandle, date_str: String) -> Result<String, String> {
    let app_local_data = app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Gagal mendapatkan AppData dir: {}", e))?;

    let source_db = app_local_data.join("pb_data").join("data.db");

    if !source_db.exists() {
        return Err("File database (data.db) tidak ditemukan di AppData!".into());
    }

    let document_dir = app_handle
        .path()
        .document_dir()
        .map_err(|e| format!("Gagal mendapatkan folder Documents: {}", e))?;

    let backup_folder = document_dir.join("Tibkam1745_Backups");
    if !backup_folder.exists() {
        fs::create_dir_all(&backup_folder)
            .map_err(|e| format!("Gagal membuat folder backup: {}", e))?;
    }

    let backup_filename = format!("backup_tibkam_{}.db", date_str);
    let target_db = backup_folder.join(&backup_filename);

    fs::copy(&source_db, &target_db)
        .map_err(|e| format!("Gagal menyalin file database: {}", e))?;

    // Rotasi Otomatis: Simpan maksimal 7 file backup terbaru
    if let Ok(entries) = fs::read_dir(&backup_folder) {
        let mut backup_files: Vec<PathBuf> = entries
            .filter_map(|e| e.ok())
            .map(|e| e.path())
            .filter(|p| p.is_file() && p.extension().map_or(false, |ext| ext == "db"))
            .collect();

        backup_files.sort_by_key(|p| {
            fs::metadata(p)
                .and_then(|m| m.modified())
                .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
        });
        backup_files.reverse();

        if backup_files.len() > 7 {
            for old_file in backup_files.iter().skip(7) {
                let _ = fs::remove_file(old_file);
            }
        }
    }

    println!("✅ [Auto-Backup] Berhasil disimpan di: {:?}", target_db);
    Ok(target_db.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![
            get_available_printers,
            print_image_silently,
            execute_native_auto_backup // 👈 Native backup command
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
                std::path::PathBuf::from("../../backend/pb_migrations")
            } else {
                let primary_path = resource_dir.join("pb_migrations");
                let fallback_path = resource_dir.join("backend").join("pb_migrations");

                if primary_path.exists() {
                    primary_path
                } else if fallback_path.exists() {
                    fallback_path
                } else {
                    primary_path
                }
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