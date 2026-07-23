use crate::error::AppResult;
use crate::model::auth::AccessToken;
use crate::model::id::UserId;
use crate::repository;
use crate::state::AppState;

/// セッションの有効期間（秒）。
const SESSION_TTL_SECONDS: i64 = 60 * 60 * 24;

/// メールアドレスとパスワードでログインし、ユーザー ID とアクセストークンを返す。
pub async fn login(
    state: &AppState,
    email: &str,
    password: &str,
) -> AppResult<(UserId, AccessToken)> {
    let user_id = repository::auth::verify_user(&state.pool, email, password).await?;
    let access_token =
        repository::auth::create_token(&state.pool, user_id, SESSION_TTL_SECONDS).await?;

    Ok((user_id, access_token))
}

/// アクセストークンに対応するセッションを破棄する。
pub async fn logout(state: &AppState, access_token: &AccessToken) -> AppResult<()> {
    repository::auth::delete_token(&state.pool, access_token).await
}

/// アクセストークンを検証し、有効ならユーザー ID を返す。
pub async fn verify_token(
    state: &AppState,
    access_token: &AccessToken,
) -> AppResult<Option<UserId>> {
    repository::auth::fetch_user_id_from_token(&state.pool, access_token).await
}
