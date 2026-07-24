use sqlx::PgPool;

use crate::error::{AppError, AppResult};
use crate::model::id::UserId;
use crate::model::user::User;

/// ID からユーザーを引く。存在しない場合は `None`。
pub async fn find_by_id(pool: &PgPool, id: UserId) -> AppResult<Option<User>> {
    let user = sqlx::query_as::<_, User>(
        r#"
            SELECT id, name, email
            FROM users
            WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::SpecificOperation)?;

    Ok(user)
}
