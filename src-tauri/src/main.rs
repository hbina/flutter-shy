#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod cmd;
mod error;
mod model;
mod parser;

fn main() {
  tauri::Builder::default()
    .manage(model::AppState::default())
    .invoke_handler(tauri::generate_handler![cmd::load_openapi_definition])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
