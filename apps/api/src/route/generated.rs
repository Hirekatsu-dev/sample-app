// このファイルは generator/src/generators/api_endpoints.ts から生成されます。
// 直接編集しないでください。

use crate::state::AppState;
#[allow(unused_imports)]
use axum::{routing::*, Router};

pub mod auth;
pub mod v1;

pub fn generated_routes() -> Router<AppState> {
    let router = Router::new()
        .merge(auth::auth_routes())
        .merge(v1::v1_routes());

    Router::new().nest("/api", router)
}
