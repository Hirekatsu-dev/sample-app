use std::net::{Ipv4Addr, SocketAddr};

use anyhow::{Context, Result};
use axum::http::{
    header::{AUTHORIZATION, CONTENT_TYPE},
    HeaderValue, Method,
};
use tokio::net::TcpListener;
use tower_http::cors::{AllowHeaders, CorsLayer};
use tower_http::trace::{DefaultMakeSpan, DefaultOnRequest, DefaultOnResponse, TraceLayer};
use tower_http::LatencyUnit;
use tracing::Level;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::EnvFilter;

mod config;
mod db;
mod env;
mod error;
mod error_code;
mod handler;
mod kbn;
mod model;
mod repository;
mod response;
mod route;
mod service;
mod state;

use config::AppConfig;
use env::{which, Environment};
use state::AppState;

/// 管理APIのポート。メンバーAPI（3000）とは別プロセスで動作する。
const PORT: u16 = 3001;

fn cors(web_base_url: &str) -> Result<CorsLayer> {
    let origin = web_base_url
        .parse::<HeaderValue>()
        .context("Failed to parse CORS origin. Check WEB_BASE_URL.")?;

    Ok(CorsLayer::new()
        .allow_headers(AllowHeaders::list([CONTENT_TYPE, AUTHORIZATION]))
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_origin(origin)
        .allow_credentials(true))
}

fn init_logger() -> Result<()> {
    let log_level = match which() {
        Environment::Development => "debug",
        Environment::Production => "info",
    };

    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| log_level.into());

    let subscriber = tracing_subscriber::fmt::layer()
        .with_file(true)
        .with_line_number(true)
        .with_target(false)
        .json();

    tracing_subscriber::registry()
        .with(subscriber)
        .with(env_filter)
        .try_init()?;

    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    init_logger()?;
    bootstrap().await
}

async fn bootstrap() -> Result<()> {
    let app_config = AppConfig::from_env()?;
    let pool = db::connect_database_with(&app_config.database);
    let cors_layer = cors(&app_config.web_base_url)?;
    let state = AppState::new(pool, app_config);

    let app = route::api_routes()
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                .on_request(DefaultOnRequest::new().level(Level::INFO))
                .on_response(
                    DefaultOnResponse::new()
                        .level(Level::INFO)
                        .latency_unit(LatencyUnit::Millis),
                ),
        )
        .layer(cors_layer)
        .with_state(state);

    let addr = SocketAddr::new(Ipv4Addr::UNSPECIFIED.into(), PORT);
    let listener = TcpListener::bind(addr).await?;
    tracing::info!("Listening on {}", addr);
    axum::serve(listener, app)
        .await
        .context("Unexpected error happened in server")
        .inspect_err(|e| {
            tracing::error!(
                error.cause_chain = ?e, error.message = %e, "Unexpected error"
            )
        })
}
