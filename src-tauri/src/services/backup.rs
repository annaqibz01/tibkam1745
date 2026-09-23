use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

fn resolve_backup_folder(app_handle: &AppHandle) -> PathBuf {
    // 1. Tembak langsung Drive D (Gunakan raw string r#"..."#)
    let target_d = PathBuf::from(r#"D:\Tibkam1745_Backups"#);
    match fs::create_dir_all(&target_d) {
        Ok(_) => {
            println!("✅ [Backup] Menggunakan target Drive D: {:?}", target_d);
            return target_d;
        }
        Err(err) => {
            eprintln!("⚠️ [Backup] Drive D gagal/tidak tersedia (Alasan: {}), mencoba drive lain...", err);
        }
    }

    // 2. Scan drive lain selain C (E sampai Z)
    for letter in b'E'..=b'Z' {
        let candidate = PathBuf::from(format!(r#"{}:\Tibkam1745_Backups"#, letter as char));
        if fs::create_dir_all(&candidate).is_ok() {
            println!("✅ [Backup] Menggunakan Drive alternatif: {:?}", candidate);
            return candidate;
        }
    }

    // 3. Failover ke Documents jika semua drive selain C tidak bisa ditulis
    eprintln!("⚠️ [Backup] Tidak ada drive sekunder yang bisa ditulis. Mengalihkan ke Documents...");
    if let Ok(document_dir) = app_handle.path().document_dir() {
        let candidate = document_dir.join("Tibkam1745_Backups");
        if fs::create_dir_all(&candidate).is_ok() {
            return candidate;
        }
    }

    // 4. Failover darurat terakhir: App Local Data
    let emergency_dir = app_handle
        .path()
        .app_local_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("Backups");
    let _ = fs::create_dir_all(&emergency_dir);
    emergency_dir
}

pub fn execute_backup(app_handle: &AppHandle, date_str: &str) -> Result<String, String> {
    let app_local_data = app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Gagal AppData dir: {}", e))?;

    let pb_data_dir = app_local_data.join("pb_data");
    let source_db = pb_data_dir.join("data.db");

    if !source_db.exists() {
        return Err("File database (data.db) tidak ditemukan!".into());
    }

    let backup_folder = resolve_backup_folder(app_handle);

    let target_db = backup_folder.join(format!("backup_tibkam_{}.db", date_str));
    fs::copy(&source_db, &target_db)
        .map_err(|e| format!("Gagal menyalin data.db: {}", e))?;

    // Salin file WAL dan SHM jika ada
    let wal_source = pb_data_dir.join("data.db-wal");
    if wal_source.exists() {
        let wal_target = backup_folder.join(format!("backup_tibkam_{}.db-wal", date_str));
        let _ = fs::copy(&wal_source, &wal_target);
    }

    let shm_source = pb_data_dir.join("data.db-shm");
    if shm_source.exists() {
        let shm_target = backup_folder.join(format!("backup_tibkam_{}.db-shm", date_str));
        let _ = fs::copy(&shm_source, &shm_target);
    }

    rotate_old_backups(&backup_folder, 7);

    Ok(target_db.to_string_lossy().to_string())
}

fn rotate_old_backups(backup_folder: &Path, max_keep: usize) {
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
                let old_wal = old_file.with_extension("db-wal");
                if old_wal.exists() { let _ = fs::remove_file(old_wal); }
                let old_shm = old_file.with_extension("db-shm");
                if old_shm.exists() { let _ = fs::remove_file(old_shm); }
            }
        }
    }
}