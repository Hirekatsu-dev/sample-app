use sqlx::PgPool;

use crate::error::{AppError, AppResult};

/// データベースへ疎通できることを確認する。
pub async fn ping(pool: &PgPool) -> AppResult<()> {
    sqlx::query("SELECT 1")
        .fetch_one(pool)
        .await
        .map_err(AppError::SpecificOperation)?;

    Ok(())
}
