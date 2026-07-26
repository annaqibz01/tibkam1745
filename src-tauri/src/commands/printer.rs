use crate::services::printer as printer_service;

#[tauri::command]
pub fn get_available_printers() -> Vec<String> {
    printer_service::get_system_printers()
}

#[tauri::command]
pub fn print_image_silently(
    app_handle: tauri::AppHandle,
    printer_name: String,
    image_base64: String,
) -> Result<(), String> {
    printer_service::print_silent(&app_handle, &printer_name, &image_base64)
}