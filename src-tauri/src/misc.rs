use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct SwaggerInfo {
  pub title: Option<String>,
  pub doc: serde_yaml::Value,
  pub servers: Vec<String>,
  #[serde(rename = "componentsInfo")]
  pub components_info: HashMap<String, serde_yaml::Value>,
}

pub fn get_swagger_title(doc: &serde_yaml::Value) -> Option<String> {
  match doc.get("info").and_then(|v| v.get("title"))? {
    serde_yaml::Value::String(s) => return Some(s.clone()),
    _ => return None,
  }
}

pub fn get_swagger_components_info(doc: &serde_yaml::Value) -> HashMap<String, serde_yaml::Value> {
  let mut result = HashMap::default();

  if let Some(o) = doc.get("components") {
    match o {
      serde_yaml::Value::Mapping(components) => {
        impl_get_swagger_components_info(components, "#/components", &mut result, 0);
      }
      _ => {}
    }
  }
  return result;
}

fn impl_get_swagger_components_info(
  components: &serde_yaml::Mapping,
  path: &str,
  result: &mut HashMap<String, serde_yaml::Value>,
  depth: usize,
) {
  if depth > 1 {
    return;
  }
  for (k, v) in components {
    match (k, v) {
      (serde_yaml::Value::String(k), v) => {
        if depth == 1 {
          result.insert(format!("{}/{}", path, k), v.clone());
        }
        match v {
          serde_yaml::Value::Mapping(o) => {
            impl_get_swagger_components_info(o, &format!("{}/{}", path, k), result, depth + 1);
          }
          _ => {}
        };
      }
      _ => {}
    }
  }
}

pub fn get_swagger_servers(doc: &serde_yaml::Value) -> Vec<String> {
  match doc.get("servers") {
    Some(serde_yaml::Value::Sequence(v)) => v
      .iter()
      .flat_map(|s| match s {
        serde_yaml::Value::Mapping(o) => o.get("url").and_then(|s| s.as_str()),
        _ => None,
      })
      .map(|s| s.to_string())
      .collect::<Vec<_>>(),
    _ => return Vec::default(),
  }
}
