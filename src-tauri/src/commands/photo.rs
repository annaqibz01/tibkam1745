// src-tauri/src/commands/photo.rs
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::{BufRead, BufReader};
use std::path::Path;
use std::process::{Command, Stdio};
use tauri::{AppHandle, Emitter, Manager};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PhotoInfo {
    pub id_pps: String,
    pub source_path: String,
    pub subfolder: String,
}

#[tauri::command]
pub async fn scan_photo_directory(root_dir: String) -> Result<Vec<PhotoInfo>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let root = Path::new(&root_dir);
        if !root.exists() || !root.is_dir() {
            return Err("Folder tidak ditemukan atau bukan direktori valid.".to_string());
        }

        let mut photo_map: HashMap<String, PhotoInfo> = HashMap::new();

        // 1. Scan foto langsung dari root folder (jika ada)
        if let Ok(files) = fs::read_dir(root) {
            for file_entry in files.flatten() {
                let file_path = file_entry.path();
                if file_path.is_file() {
                    if let Some(ext) = file_path.extension().and_then(|e| e.to_str()) {
                        let ext_lower = ext.to_lowercase();
                        if ext_lower == "jpg" || ext_lower == "jpeg" || ext_lower == "png" || ext_lower == "webp" {
                            if let Some(stem) = file_path.file_stem().and_then(|s| s.to_str()) {
                                let id_pps = stem.trim().to_string();
                                if !id_pps.is_empty() {
                                    photo_map.insert(
                                        id_pps.clone(),
                                        PhotoInfo {
                                            id_pps,
                                            source_path: file_path.to_string_lossy().to_string(),
                                            subfolder: "".to_string(),
                                        },
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. Scan foto dari subfolder (diurutkan ascending: subfolder baru menimpa subfolder lama)
        let mut subfolders: Vec<(String, std::path::PathBuf)> = Vec::new();
        if let Ok(entries) = fs::read_dir(root) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(folder_name) = path.file_name().and_then(|n| n.to_str()) {
                        subfolders.push((folder_name.to_string(), path));
                    }
                }
            }
        }

        subfolders.sort_by(|a, b| a.0.cmp(&b.0));

        for (folder_name, folder_path) in subfolders {
            if let Ok(files) = fs::read_dir(&folder_path) {
                for file_entry in files.flatten() {
                    let file_path = file_entry.path();
                    if file_path.is_file() {
                        if let Some(ext) = file_path.extension().and_then(|e| e.to_str()) {
                            let ext_lower = ext.to_lowercase();
                            if ext_lower == "jpg" || ext_lower == "jpeg" || ext_lower == "png" || ext_lower == "webp" {
                                if let Some(stem) = file_path.file_stem().and_then(|s| s.to_str()) {
                                    let id_pps = stem.trim().to_string();
                                    if !id_pps.is_empty() {
                                        photo_map.insert(
                                            id_pps.clone(),
                                            PhotoInfo {
                                                id_pps,
                                                source_path: file_path.to_string_lossy().to_string(),
                                                subfolder: folder_name.clone(),
                                            },
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(photo_map.into_values().collect())
    })
    .await
    .map_err(|e| format!("Thread error: {}", e))?
}

#[tauri::command]
pub async fn execute_photo_compressor_sidecar(
    app_handle: AppHandle,
    jobs_json: String,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let temp_dir = std::env::temp_dir();
        let jobs_file_path = temp_dir.join("tibkam_photo_jobs.json");

        fs::write(&jobs_file_path, &jobs_json)
            .map_err(|e| format!("Gagal menulis file daftar tugas sementara: {}", e))?;

        let resource_dir = app_handle
            .path()
            .resource_dir()
            .map_err(|e| format!("Gagal mengambil resource dir: {}", e))?;

        let sidecar_exe = resource_dir.join("bin/photo_processor.exe");

        let mut cmd = Command::new(&sidecar_exe);
        cmd.arg("--file").arg(jobs_file_path.to_string_lossy().to_string());
        cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

        #[cfg(target_os = "windows")]
        cmd.creation_flags(CREATE_NO_WINDOW);

        let mut child = cmd
            .spawn()
            .map_err(|e| format!("Gagal mengeksekusi photo_processor.exe: {}", e))?;

        if let Some(stdout) = child.stdout.take() {
            let handle = app_handle.clone();
            std::thread::spawn(move || {
                let reader = BufReader::new(stdout);
                for line in reader.lines().flatten() {
                    let _ = handle.emit("photo-compress-progress", line);
                }
            });
        }

        let status = child
            .wait()
            .map_err(|e| format!("Gagal menunggu proses sidecar: {}", e))?;

        if !status.success() {
            return Err("Proses kompresi foto Go sidecar gagal atau dihentikan.".to_string());
        }

        Ok(())
    })
    .await
    .map_err(|e| format!("Thread error: {}", e))?
}

#[tauri::command]
pub async fn read_file_base64(path: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let bytes = fs::read(&path).map_err(|e| format!("Gagal membaca berkas {}: {}", path, e))?;
        Ok(to_base64(&bytes))
    })
    .await
    .map_err(|e| format!("Thread error: {}", e))?
}

fn to_base64(bytes: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut buf = String::with_capacity((bytes.len() + 2) / 3 * 4);
    for chunk in bytes.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;
        buf.push(CHARS[((triple >> 18) & 0x3F) as usize] as char);
        buf.push(CHARS[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            buf.push(CHARS[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            buf.push('=');
        }
        if chunk.len() > 2 {
            buf.push(CHARS[(triple & 0x3F) as usize] as char);
        } else {
            buf.push('=');
        }
    }
    buf
}