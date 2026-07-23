// このファイルは generator/src/generators/errors.ts から生成されます。
// 直接編集しないでください。

use axum::http::StatusCode;
use serde::Serialize;
/// APIの結果コード
#[allow(dead_code)]
#[derive(Debug, Eq, PartialEq, Serialize, strum::EnumString, strum::Display)]
pub enum ErrorCode {
    #[strum(serialize = "E0001")]
    #[serde(rename = "E0001")]
    Unknown, // 不明なエラーが発生しました。
    #[strum(serialize = "E0002")]
    #[serde(rename = "E0002")]
    InvalidParameter, // パラメータが不正です。
    #[strum(serialize = "E0004")]
    #[serde(rename = "E0004")]
    NotFound, // データが見つかりませんでした。
}

impl ErrorCode {
    pub fn http_status_code(&self) -> StatusCode {
        match &self {
            Self::Unknown => StatusCode::INTERNAL_SERVER_ERROR,
            Self::InvalidParameter => StatusCode::BAD_REQUEST,
            Self::NotFound => StatusCode::NOT_FOUND,
        }
    }

    /// error_code に対応する既定のクライアント向けメッセージ
    pub fn default_message(&self) -> &'static str {
        match &self {
            Self::Unknown => "不明なエラーが発生しました。",
            Self::InvalidParameter => "パラメータが不正です。",
            Self::NotFound => "データが見つかりませんでした。",
        }
    }
}
