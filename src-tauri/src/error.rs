use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum PError {
  InvalidSwaggerDefinition(String),
}

impl std::error::Error for PError {}

impl std::fmt::Display for PError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:#?}", self)
  }
}

impl From<apple_bloom::Error> for PError {
  fn from(e: apple_bloom::Error) -> Self {
    PError::InvalidSwaggerDefinition(e.to_string())
  }
}

impl From<serde_json::Error> for PError {
  fn from(e: serde_json::Error) -> Self {
    PError::InvalidSwaggerDefinition(e.to_string())
  }
}

impl From<serde_yaml::Error> for PError {
  fn from(e: serde_yaml::Error) -> Self {
    PError::InvalidSwaggerDefinition(e.to_string())
  }
}
