use sqlx::PgPool;

use crate::config::AppConfig;

/// ハンドラから参照するアプリケーション全体の状態。
///
/// repository 層は `&PgPool` を受け取る関数として実装しているため、
/// ここでは接続プールと設定値だけを保持する。
#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    #[allow(dead_code)]
    pub config: AppConfig,
}

impl AppState {
    pub fn new(pool: PgPool, config: AppConfig) -> Self {
        Self { pool, config }
    }
}
