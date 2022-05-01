#[derive(Default)]
pub struct AppState {}

pub type AppArg<'a> = tauri::State<'a, AppState>;
