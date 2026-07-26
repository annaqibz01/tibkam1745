use serde::Serialize;
use std::io::Write;
use std::process::{Command, Stdio};
use tauri::{AppHandle, Manager};

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

pub fn get_system_printers() -> Vec<String> {
    let mut cmd = Command::new("powershell");
    cmd.arg("-Command").arg("Get-Printer | Select-Object -ExpandProperty Name");

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    match cmd.output() {
        Ok(out) => String::from_utf8_lossy(&out.stdout)
            .lines()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect(),
        Err(_) => vec![],
    }
}

pub fn print_silent(app_handle: &AppHandle, printer_name: &str, image_base64: &str) -> Result<(), String> {
    let resource_dir = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Gagal resource dir: {}", e))?;
    
    let printer_exe = resource_dir.join("bin/printer_service.exe");
    let payload = PythonPayload { printer_name, image_base64 };
    let json_str = serde_json::to_string(&payload).map_err(|e| e.to_string())?;

    let mut cmd = Command::new(printer_exe);
    cmd.stdin(Stdio::piped()).stdout(Stdio::piped()).stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let mut child = cmd.spawn().map_err(|e| format!("Gagal spawn printer service: {}", e))?;

    if let Some(mut stdin) = child.stdin.take() {
        stdin.write_all(json_str.as_bytes()).map_err(|e| e.to_string())?;
    }

    let output = child.wait_with_output().map_err(|e| e.to_string())?;
    let stdout_str = String::from_utf8_lossy(&output.stdout);

    if stdout_str.contains("SUCCESS") || output.status.success() {
        Ok(())
    } else {
        let stderr_str = String::from_utf8_lossy(&output.stderr);
        Err(format!("Printer Error: {} | {}", stdout_str, stderr_str))
    }
}