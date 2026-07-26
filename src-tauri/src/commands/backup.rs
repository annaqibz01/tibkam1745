use crate::services::backup as backup_service;

#[tauri::command]
pub fn execute_native_auto_backup(
    app_handle: tauri::AppHandle,
    date_str: String,
) -> Result<String, String> {
    backup_service::execute_backup(&app_handle, &date_str)
}