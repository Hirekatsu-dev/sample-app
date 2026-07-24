use crate::error::AppResult;
use crate::model::id::UserId;
use crate::model::user::User;
use crate::repository;
use crate::state::AppState;

/// ID に対応するユーザーを返す。
pub async fn find_current_user(state: &AppState, id: UserId) -> AppResult<Option<User>> {
    repository::user::find_by_id(&state.pool, id).await
}
