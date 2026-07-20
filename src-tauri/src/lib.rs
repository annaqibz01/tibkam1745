use tauri::Manager;
use std::fs;
use std::process::Command;
use std::sync::Mutex; // <-- TAMBAHAN: Untuk mengunci data process di memori

// Wadah untuk menyimpan handle proses PocketBase agar bisa dimatikan nanti
struct PocketbaseChild(Mutex<Option<std::process::Child>>);

// Konfigurasi khusus Windows agar berjalan senyap di latar belakang
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Kita pecah Builder menjadi variabel 'app' terlebih dahulu
    let app = tauri::Builder::default()
        .setup(|app| {
            // ==================== 0. KILL SWITCH (DEV ONLY MODE) ====================
            // Tetap pertahankan ini agar saat auto-reload coding, port langsung bersih
            #[cfg(target_os = "windows")]
            {
                let _ = Command::new("taskkill")
                    .arg("/F")
                    .arg("/IM")
                    .arg("pocketbase.exe")
                    .creation_flags(CREATE_NO_WINDOW)
                    .status();
            }

            // 1. KODE ASLI: Logger bawaan Tauri saat mode Debug
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // ==================== LOGIKA INTEGRASI POCKETBASE ====================

            let app_local_data = app.path().app_local_data_dir()
                .expect("Gagal mendapatkan jalur AppData Local");
            let pb_data_dir = app_local_data.join("pb_data");
            let target_db_file = pb_data_dir.join("data.db");

            if !pb_data_dir.exists() {
                fs::create_dir_all(&pb_data_dir)
                    .expect("Gagal membuat folder pb_data di AppData");
            }

            let resource_dir = app.path().resource_dir()
                .expect("Gagal mendapatkan jalur Resource folder");
                
            let pocketbase_exe = resource_dir.join("bin/pocketbase.exe");
            let pb_migrations_dir = resource_dir.join("pb_migrations");
            let template_db_file = resource_dir.join("bin/koleksi_awal.db");

            if !target_db_file.exists() && template_db_file.exists() {
                fs::copy(&template_db_file, &target_db_file)
                    .expect("Gagal menyalin template database awal");
            }

            let mut cmd = Command::new(pocketbase_exe);
            cmd.arg("serve")
               .arg("--dir")
               .arg(pb_data_dir.to_str().unwrap())
               .arg("--migrationsDir")
               .arg(pb_migrations_dir.to_str().unwrap());

            #[cfg(target_os = "windows")]
            cmd.creation_flags(CREATE_NO_WINDOW);

            // Spawning PocketBase
            let child = cmd.spawn().expect("Gagal mengeksekusi PocketBase binary");

            // SIMPAN HANDLE: Masukkan proses PocketBase ke dalam State Tauri agar bisa diakses global
            app.manage(PocketbaseChild(Mutex::new(Some(child))));

            Ok(())
        })
        .build(tauri::generate_context!()) // <-- Ubah .run menjadi .build
        .expect("error while building tauri application");

    // ==================== LIFECYCLE SHUTDOWN HANDLER ====================
    // Logika yang berjalan ketika aplikasi utama ditutup oleh user
    app.run(|app_handle, event| match event {
        tauri::RunEvent::Exit => {
            // Ambil kembali handle PocketBase yang disimpan di objek State tadi
            if let Some(state) = app_handle.try_state::<PocketbaseChild>() {
                if let Ok(mut guard) = state.0.lock() {
                    if let Some(mut child) = guard.take() {
                        // Tembak mati PocketBase secara paksa dan bersih!
                        let _ = child.kill();
                    }
                }
            }
        }
        _ => {}
    });
}