use std::fs;
use std::process::{Command, Child};
use tauri::{App, Manager};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn kill_existing_instance() {
    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("taskkill")
            .arg("/F")
            .arg("/IM")
            .arg("pocketbase.exe")
            .creation_flags(CREATE_NO_WINDOW)
            .status();
    }
}

pub fn spawn_service(app: &App) -> Result<Child, String> {
    let app_local_data = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Gagal AppData dir: {}", e))?;

    let pb_data_dir = app_local_data.join("pb_data");
    let target_db_file = pb_data_dir.join("data.db");

    if !pb_data_dir.exists() {
        fs::create_dir_all(&pb_data_dir).map_err(|e| e.to_string())?;
    }

    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Gagal Resource dir: {}", e))?;

    let pocketbase_exe = resource_dir.join("bin/pocketbase.exe");
    let template_db_file = resource_dir.join("bin/koleksi_awal.db");

    let pb_migrations_dir = if cfg!(debug_assertions) {
        std::path::PathBuf::from("../../backend/pb_migrations")
    } else {
        let primary = resource_dir.join("pb_migrations");
        let fallback = resource_dir.join("backend").join("pb_migrations");
        if primary.exists() { primary } else if fallback.exists() { fallback } else { primary }
    };

    if !target_db_file.exists() && template_db_file.exists() {
        fs::copy(&template_db_file, &target_db_file).map_err(|e| e.to_string())?;
    }

    let mut cmd = Command::new(pocketbase_exe);
    cmd.arg("serve")
        .arg("--dir")
        .arg(pb_data_dir.to_string_lossy().as_ref())
        .arg("--migrationsDir")
        .arg(pb_migrations_dir.to_string_lossy().as_ref());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    cmd.spawn().map_err(|e| format!("Gagal spawn PocketBase: {}", e))
}