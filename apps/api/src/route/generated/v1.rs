// このファイルは generator/src/generators/api_endpoints.ts から生成されます。
// 直接編集しないでください。

use crate::state::AppState;
#[allow(unused_imports)]
use axum::{routing::*, Router};

pub fn v1_routes() -> Router<AppState> {
    let router = Router::new();

    Router::new().nest("/v1", router)
}
