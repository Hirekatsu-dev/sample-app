use serde::Serialize;

pub mod generated;
pub mod id;

/// ID だけを返すレスポンス。
#[allow(dead_code)]
#[derive(Serialize)]
pub struct IdResponse<T> {
    id: T,
}

impl<T> IdResponse<T> {
    #[allow(dead_code)]
    pub fn new(id: T) -> Self {
        Self { id }
    }
}
