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

/// ログイン中のユーザー情報
#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct GetMeResponseData {
    /// ユーザーID
    #[garde(skip)]
    pub id: id::UserId,
    /// 表示名
    #[garde(skip)]
    pub name: String,
    /// メールアドレス
    #[garde(email)]
    pub email: String,
}
