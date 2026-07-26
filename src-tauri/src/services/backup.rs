use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub fn execute_backup(app_handle: &AppHandle, date_str: &str) -> Result<String, String> {
    let app_local_data = app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Gagal AppData dir: {}", e))?;

    let source_db = app_local_data.join("pb_data").join("data.db");
    if !source_db.exists() {
        return Err("File database (data.db) tidak ditemukan!".into());
    }

    let document_dir = app_handle
        .path()
        .document_dir()
        .map_err(|e| format!("Gagal Documents dir: {}", e))?;

    let backup_folder = document_dir.join("Tibkam1745_Backups");
    if !backup_folder.exists() {
        fs::create_dir_all(&backup_folder).map_err(|e| e.to_string())?;
    }

    let target_db = backup_folder.join(format!("backup_tibkam_{}.db", date_str));
    fs::copy(&source_db, &target_db).map_err(|e| e.to_string())?;

    rotate_old_backups(&backup_folder, 7);

    Ok(target_db.to_string_lossy().to_string())
}

fn rotate_old_backups(backup_folder: &PathBuf, max_keep: usize) {
    if let Ok(entries) = fs::read_dir(backup_folder) {
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

        if backup_files.len() > max_keep {
            for old_file in backup_files.iter().skip(max_keep) {
                let _ = fs::remove_file(old_file);
            }
        }
    }
}