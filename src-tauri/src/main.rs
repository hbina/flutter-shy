#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod cmd;
mod error;
mod misc;

fn main() {
  tauri::Builder::default()
    .manage(misc::SwaggerInfo::default())
    .invoke_handler(tauri::generate_handler![cmd::load_openapi_definition])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
