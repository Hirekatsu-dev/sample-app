use axum::extract::State;

use crate::error::ApiError;
use crate::response::{render_empty, ApiResult};
use crate::service;
use crate::state::AppState;

/// APIサーバーが起動していることを確認する。
pub async fn health_check() -> ApiResult<()> {
    render_empty()
}

/// APIサーバーからデータベースへ疎通できることを確認する。
pub async fn health_check_db(State(state): State<AppState>) -> ApiResult<()> {
    service::health_check::check_db(&state)
        .await
        .map_err(ApiError::from)?;

    render_empty()
}
