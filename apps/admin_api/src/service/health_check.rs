use crate::error::AppResult;
use crate::repository;
use crate::state::AppState;

/// データベースへの疎通確認を行う。
pub async fn check_db(state: &AppState) -> AppResult<()> {
    repository::health_check::ping(&state.pool).await
}
