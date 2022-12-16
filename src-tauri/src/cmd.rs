use std::io::Cursor;

use apple_bloom::{from_reader, OpenApi};
use serde::{Deserialize, Serialize};
use tauri::command;

use crate::error::PError;

#[derive(Serialize, Deserialize)]
pub struct Parameter {}

#[command]
pub async fn load_openapi_definition(content: String) -> Result<OpenApi, PError> {
  let result = from_reader(Cursor::new(content))?;
  match &result {
    OpenApi::V2(_) => todo!(),
    OpenApi::V3_0(v) => v3::parse_spec(&*v),
  }
  Ok(result)
}

mod v3 {
  use std::collections::BTreeMap;

  use apple_bloom::v3::{ObjectOrReference, Parameter, Spec};

  use crate::parser::parse_path;

  pub fn parse_spec(spec: &Spec) {
    let result = spec
      .paths
      .iter()
      .map(|(k, v)| {
        parse_path(k.as_str());
      })
      .collect::<Vec<_>>();
  }

  pub fn parse_parameters(parameter: BTreeMap<String, ObjectOrReference<Parameter>>) {}
}
