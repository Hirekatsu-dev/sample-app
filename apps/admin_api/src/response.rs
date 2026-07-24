use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use serde::{Deserialize, Serialize};

use crate::error::{ApiError, AppError};

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct EmptyResponse {}

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct DataResponse<T> {
    pub data: T,
}

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct ListResponse<T> {
    pub list: Vec<T>,
    pub count: i64,
}

#[derive(Serialize, Debug)]
#[serde(untagged)]
pub enum ApiResponse<T = ()> {
    #[allow(dead_code)]
    Empty(EmptyResponse),
    #[allow(dead_code)]
    Data(DataResponse<T>),
    #[allow(dead_code)]
    List(ListResponse<T>),
}

pub type ApiResult<T> = Result<Json<ApiResponse<T>>, ApiError>;

impl IntoResponse for ApiResponse {
    fn into_response(self) -> axum::response::Response {
        match serde_json::to_string(&self) {
            Ok(body) => (StatusCode::OK, body).into_response(),
            Err(err) => ApiError::from(AppError::Serialize(err)).into_response(),
        }
    }
}

pub fn render_empty<E>() -> Result<Json<ApiResponse<()>>, E> {
    Ok(Json(ApiResponse::Empty(EmptyResponse {})))
}

#[allow(dead_code)]
pub fn render_data<T: Serialize, E>(data: T) -> Result<Json<ApiResponse<T>>, E> {
    Ok(Json(ApiResponse::Data::<T>(DataResponse { data })))
}

#[allow(dead_code)]
pub fn render_list<T: Serialize, E>(list: Vec<T>, count: i64) -> Result<Json<ApiResponse<T>>, E> {
    Ok(Json(ApiResponse::List::<T>(ListResponse { list, count })))
}
