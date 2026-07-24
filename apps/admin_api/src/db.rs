use sqlx::{postgres::PgConnectOptions, PgPool, Postgres, Transaction};

use crate::config::DatabaseConfig;
use crate::error::{AppError, AppResult};

fn make_pg_connect_options(cfg: &DatabaseConfig) -> PgConnectOptions {
    PgConnectOptions::new()
        .host(&cfg.host)
        .port(cfg.port)
        .username(&cfg.username)
        .password(&cfg.password)
        .database(&cfg.database)
}

pub fn connect_database_with(cfg: &DatabaseConfig) -> PgPool {
    PgPool::connect_lazy_with(make_pg_connect_options(cfg))
}

#[allow(dead_code)]
pub async fn begin(pool: &PgPool) -> AppResult<Transaction<'_, Postgres>> {
    pool.begin().await.map_err(AppError::Transaction)
}

#[allow(dead_code)]
pub async fn set_transaction_serializable(tx: &mut Transaction<'_, Postgres>) -> AppResult<()> {
    sqlx::query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        .execute(&mut **tx)
        .await
        .map_err(AppError::SpecificOperation)?;

    Ok(())
}
