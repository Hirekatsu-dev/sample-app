use chrono::{Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::model::auth::AccessToken;
use crate::model::id::UserId;

/// メールアドレスとパスワードを検証し、一致するユーザーの ID を返す。
///
/// ユーザーが存在しない場合とパスワードが一致しない場合は、
/// どちらも `Unauthenticated` を返す（アカウントの存在を推測させないため）。
pub async fn verify_user(pool: &PgPool, email: &str, password: &str) -> AppResult<UserId> {
    #[derive(sqlx::FromRow)]
    struct Row {
        id: UserId,
        password: String,
    }

    let row = sqlx::query_as::<_, Row>(
        r#"
            SELECT id, password
            FROM users
            WHERE email = $1
        "#,
    )
    .bind(email)
    .fetch_optional(pool)
    .await
    .map_err(AppError::SpecificOperation)?;

    let row = row.ok_or(AppError::Unauthenticated)?;

    if !bcrypt::verify(password, &row.password)? {
        return Err(AppError::Unauthenticated);
    }

    Ok(row.id)
}

/// ユーザーに紐づく新しいセッションを作成し、アクセストークンを返す。
pub async fn create_token(
    pool: &PgPool,
    user_id: UserId,
    ttl_seconds: i64,
) -> AppResult<AccessToken> {
    let token = Uuid::new_v4().simple().to_string();
    let expire_at = Utc::now() + Duration::seconds(ttl_seconds);

    sqlx::query(
        r#"
            INSERT INTO user_sessions (
                user_id
                ,access_token_code
                ,expire_at
            ) VALUES (
                $1
                ,$2
                ,$3
            )
        "#,
    )
    .bind(user_id)
    .bind(&token)
    .bind(expire_at)
    .execute(pool)
    .await
    .map_err(AppError::SpecificOperation)?;

    Ok(AccessToken(token))
}

/// 有効なアクセストークンからユーザー ID を引く。
///
/// トークンが存在しない、または有効期限切れの場合は `None` を返す。
pub async fn fetch_user_id_from_token(
    pool: &PgPool,
    access_token: &AccessToken,
) -> AppResult<Option<UserId>> {
    let user_id = sqlx::query_scalar::<_, UserId>(
        r#"
            SELECT user_id
            FROM user_sessions
            WHERE access_token_code = $1
              AND NOW() < expire_at
        "#,
    )
    .bind(&access_token.0)
    .fetch_optional(pool)
    .await
    .map_err(AppError::SpecificOperation)?;

    Ok(user_id)
}

/// アクセストークンに対応するセッションを削除する。
pub async fn delete_token(pool: &PgPool, access_token: &AccessToken) -> AppResult<()> {
    sqlx::query(
        r#"
            DELETE FROM user_sessions
            WHERE access_token_code = $1
        "#,
    )
    .bind(&access_token.0)
    .execute(pool)
    .await
    .map_err(AppError::SpecificOperation)?;

    Ok(())
}
