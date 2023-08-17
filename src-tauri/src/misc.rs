use serde::{Deserialize, Serialize};

#[derive(Default, Serialize, Deserialize)]
pub struct SwaggerInfo {
  pub title: Option<String>,
  pub doc: serde_yaml::Value,
}

pub fn get_swagger_title(doc: &serde_yaml::Value) -> Option<String> {
  match doc.get("info").and_then(|v| v.get("title"))? {
    serde_yaml::Value::String(s) => return Some(s.clone()),
    _ => return None,
  }
}

// pub fn get_swagger_paths(doc: &serde_yaml::Value) -> Option<Vec<String>> {
//   match doc.get("paths")? {
//     serde_yaml::Value::Mapping(v) => todo!(),
//     _ => return None,
//   }
// }
