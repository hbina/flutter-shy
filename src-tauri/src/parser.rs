use nom::{
  bytes::complete::{tag, take_till},
  multi::many0,
  sequence::preceded,
  IResult,
};

#[derive(Debug, PartialEq, Eq)]
pub enum PathType {
  Raw(String),
  Ident(String),
}

impl PathType {
  pub fn raw<T>(input: T) -> PathType
  where
    T: Into<String>,
  {
    PathType::Raw(input.into())
  }

  pub fn ident<T>(input: T) -> PathType
  where
    T: Into<String>,
  {
    PathType::Raw(input.into())
  }
}

pub fn parse_path(input: &str) -> Vec<PathType> {
  let (left, right) = many0(|input| -> IResult<&str, Vec<PathType>> {
    let (left, before_ident) = take_till(|v| v == '{')(input)?;
    let (after_ident, ident) = preceded(tag("{"), take_till(|v| v == '}'))(left)?;

    Ok((
      &after_ident[1..],
      vec![PathType::raw(before_ident), PathType::ident(ident)],
    ))
  })(input)
  .unwrap();

  let right_is_empty = right.is_empty();
  let mut flatten = right.into_iter().flatten().collect::<Vec<_>>();

  if right_is_empty {
    return vec![PathType::raw(left)];
  } else if left.len() > 1 {
    flatten.push(PathType::raw(left));
    return flatten;
  }

  flatten
}

#[test]
fn test_parse_path() {
  assert_eq!(vec![PathType::raw("/pets")], parse_path("/pets"));
  assert_eq!(
    vec![PathType::raw("/pets/"), PathType::ident("petId")],
    parse_path("/pets/{petId}")
  );
  assert_eq!(
    vec![
      PathType::raw("/pets/"),
      PathType::ident("petId"),
      PathType::raw("/user")
    ],
    parse_path("/pets/{petId}/user")
  );
  assert_eq!(
    vec![
      PathType::raw("/pets/"),
      PathType::ident("petId"),
      PathType::raw("/user/"),
      PathType::ident("name")
    ],
    parse_path("/pets/{petId}/user/{name}")
  );
}
