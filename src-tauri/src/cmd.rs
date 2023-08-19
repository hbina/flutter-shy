use tauri::command;

use crate::{
  error::PError,
  misc::{get_swagger_components_info, get_swagger_title, SwaggerInfo},
};

#[command]
pub async fn load_openapi_definition(content: String) -> Result<SwaggerInfo, PError> {
  let doc = serde_yaml::from_reader(std::io::Cursor::new(content))?;
  let title = get_swagger_title(&doc);
  let components_info = get_swagger_components_info(&doc);
  let result = SwaggerInfo {
    title,
    doc,
    components_info,
  };
  Ok(result)
}
