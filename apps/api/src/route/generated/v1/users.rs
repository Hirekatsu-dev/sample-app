// このファイルは generator/src/generators/api_endpoints.ts から生成されます。
// 直接編集しないでください。

use crate::handler::generated::v1::users as handler;
use crate::state::AppState;
#[allow(unused_imports)]
use axum::{routing::*, Router};

pub fn users_routes() -> Router<AppState> {
    let router = Router::new().route("/me", get(handler::get_me));

    Router::new().nest("/users", router)
}
