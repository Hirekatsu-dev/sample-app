use axum::Router;

use crate::route::{custom::custom_routes, generated::generated_routes};
use crate::state::AppState;

mod custom;
mod generated;

pub fn api_routes() -> Router<AppState> {
    Router::new()
        .merge(generated_routes())
        .merge(custom_routes())
}
