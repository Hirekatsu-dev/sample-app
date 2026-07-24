// このファイルは generator/src/generators/api_endpoints.ts から生成されます。
// 直接編集しないでください。

use crate::state::AppState;
#[allow(unused_imports)]
use axum::{routing::*, Router};

pub mod users;

pub fn v1_routes() -> Router<AppState> {
    let router = Router::new().merge(users::users_routes());

    Router::new().nest("/v1", router)
}
