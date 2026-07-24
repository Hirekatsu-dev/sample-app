// このファイルは generator/src/generators/api_endpoints.ts から生成されます。
// 直接編集しないでください。

use crate::handler::generated::auth as handler;
use crate::state::AppState;
#[allow(unused_imports)]
use axum::{routing::*, Router};

pub fn auth_routes() -> Router<AppState> {
    let router = Router::new()
        .route("/login", post(handler::login))
        .route("/logout", post(handler::logout));

    Router::new().nest("/auth", router)
}
