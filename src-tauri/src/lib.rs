mod commands;
mod services;
mod state;

use state::PocketbaseChild;
use std::sync::Mutex;
use tauri::Manager;

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
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::printer::get_available_printers,
            commands::printer::print_image_silently,
            commands::backup::execute_native_auto_backup,
            commands::photo::scan_photo_directory,
            commands::photo::execute_photo_compressor_sidecar,
            commands::photo::read_file_base64
        ])
        .setup(|app| {
            // 1. Matikan instance PocketBase lama jika ada
            services::pocketbase::kill_existing_instance();

            // 2. Setup Logger di dev mode
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // 3. Spawn PocketBase
            let child = services::pocketbase::spawn_service(app)
                .expect("Gagal mengeksekusi PocketBase binary");

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