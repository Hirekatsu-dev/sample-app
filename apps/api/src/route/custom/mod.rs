use axum::Router;

use crate::state::AppState;
use health_check::health_check_routers;

pub mod health_check;

pub fn custom_routes() -> Router<AppState> {
    let router = Router::new().merge(health_check_routers());

    Router::new().nest("/api", router)
}
