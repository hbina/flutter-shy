use tauri::command;

#[command]
pub async fn load_openapi_definition(content: String) -> Result<(), crate::error::PError> {
  let result = apple_bloom::from_reader(std::io::Cursor::new(content))?;
  println!("result:\n{:#?}", result);
  Ok(())
}
