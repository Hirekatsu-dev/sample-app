use serde::{Deserialize, Serialize};

use crate::model::id::UserId;

/// ユーザーのドメインモデル。
///
/// パスワードなどの秘匿情報は含めない。
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: UserId,
    pub name: String,
    pub email: String,
}
