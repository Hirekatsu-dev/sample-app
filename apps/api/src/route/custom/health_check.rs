use axum::{routing::get, Router};

use crate::handler::custom::health_check::{health_check, health_check_db};
use crate::state::AppState;

pub fn health_check_routers() -> Router<AppState> {
    let routers = Router::new()
        .route("/", get(health_check))
        .route("/db", get(health_check_db));

    Router::new().nest("/health", routers)
}
