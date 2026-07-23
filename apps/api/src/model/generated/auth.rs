// このファイルは generator/src/generators/api_schemas.ts から生成されます。
// 直接編集しないでください。

#[allow(unused_imports)]
use crate::model::id;
#[allow(unused_imports)]
use chrono::{DateTime, Utc};
#[allow(unused_imports)]
use garde::Validate;
#[allow(unused_imports)]
use serde::{Deserialize, Serialize};
#[allow(unused_imports)]
use uuid::Uuid;

/// ログインパラメータ
#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct PostLoginRequestParams {
    /// メールアドレス
    #[garde(email)]
    pub email: String,
    /// パスワード
    #[garde(skip)]
    pub password: String,
}

/// ログインレスポンス
#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct PostLoginResponseData {
    /// ユーザーID
    #[garde(skip)]
    pub user_id: id::UserId,
    /// アクセストークン
    #[garde(skip)]
    pub access_token: String,
}
