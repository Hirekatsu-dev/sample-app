use axum::{http::StatusCode, response::IntoResponse};
use thiserror::Error;

use crate::error_code::ErrorCode;

/// アプリケーション内部で扱うエラー。
///
/// service / repository 層はこの型を返し、handler 層で `ApiError` に変換する。
#[allow(dead_code)]
#[derive(Error, Debug)]
pub enum AppError {
    #[error("{0}")]
    UnprocessableEntity(String),
    #[error("{0}")]
    EntityNotFound(String),
    #[error("{0}")]
    ValidationError(#[from] garde::Report),
    #[error("トランザクションを実行できませんでした。")]
    Transaction(#[source] sqlx::Error),
    #[error("データベース処理実行中にエラーが発生しました。")]
    SpecificOperation(#[source] sqlx::Error),
    #[error("No rows affected: {0}")]
    NoRowsAffected(String),
    #[error("{0}")]
    InvalidUuid(#[from] uuid::Error),
    #[error("{0}")]
    AlreadyExists(String),
    #[error("内部エラーが発生しました")]
    InternalServerError,
    #[error("{0}")]
    ConversionEntity(String),
    #[error("{0}")]
    Config(#[from] config::ConfigError),
    #[error("{0}")]
    Serialize(#[from] serde_json::Error),
    #[error("{0}")]
    Strum(#[from] strum::ParseError),
}

/// エラー型が `AppError` なものを扱える `Result` 型
pub type AppResult<T> = Result<T, AppError>;

struct LogContext {
    level: tracing::Level,
    message: String,
    fields: serde_json::Map<String, serde_json::Value>,
}

/// クライアントに返すエラー。
///
/// `ErrorCode` から HTTP ステータスと既定メッセージを導出する。
/// 上書きしたい場合は `with_status_code` / `with_message` を使う。
pub struct ApiError {
    error_code: ErrorCode,
    status_code: StatusCode,
    message: String,
    data: serde_json::Map<String, serde_json::Value>,
    log_context: LogContext,
}

#[allow(dead_code)]
impl ApiError {
    pub fn new(error_code: ErrorCode, log_level: tracing::Level) -> Self {
        let status_code = error_code.http_status_code();
        let message = error_code.default_message().to_string();

        Self {
            error_code,
            message,
            status_code,
            data: serde_json::Map::new(),
            log_context: LogContext {
                level: log_level,
                message: String::new(),
                fields: serde_json::Map::new(),
            },
        }
    }

    pub fn with_status_code(mut self, status_code: StatusCode) -> Self {
        self.status_code = status_code;

        self
    }

    pub fn with_message<T: Into<String>>(mut self, message: T) -> Self {
        self.message = message.into();

        self
    }

    pub fn with_data<K: Into<String>, V: Into<serde_json::Value>>(
        mut self,
        key: K,
        value: V,
    ) -> Self {
        self.data.insert(key.into(), value.into());

        self
    }

    pub fn with_log_message<T: Into<String>>(mut self, message: T) -> Self {
        self.log_context.message = message.into();

        self
    }

    pub fn with_log_fields<K: Into<String>, V: Into<serde_json::Value>>(
        mut self,
        key: K,
        value: V,
    ) -> Self {
        self.log_context.fields.insert(key.into(), value.into());

        self
    }
}

/// `AppError` から `ApiError` への既定の変換。
///
/// クライアントに詳細を出さないよう、内部エラーは `ErrorCode` に丸めてログにだけ残す。
impl From<AppError> for ApiError {
    fn from(value: AppError) -> Self {
        let error_code = match &value {
            AppError::EntityNotFound(_) => ErrorCode::NotFound,
            AppError::ValidationError(_) | AppError::InvalidUuid(_) => ErrorCode::InvalidParameter,
            AppError::AlreadyExists(_) => ErrorCode::InvalidParameter,
            _ => ErrorCode::Unknown,
        };

        let log_level = if error_code == ErrorCode::Unknown {
            tracing::Level::ERROR
        } else {
            tracing::Level::WARN
        };

        ApiError::new(error_code, log_level).with_log_message(value.to_string())
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        let error_code = self.error_code;
        let mut body = serde_json::Map::new();
        body.insert("error_code".into(), error_code.to_string().into());

        if !self.message.is_empty() {
            body.insert("message".into(), self.message.into());
        }

        if !self.data.is_empty() {
            body.insert("data".into(), self.data.into());
        }

        let body_string = serde_json::Value::Object(body).to_string();

        let status_code = self.status_code;
        let mut response = (status_code, body_string).into_response();

        // RFC 6750 に従い、Bearer トークン認証の失敗時は WWW-Authenticate: Bearer を返す。
        // これがないと Chrome が Basic 認証の失敗と誤解釈することがある。
        if status_code == StatusCode::UNAUTHORIZED {
            response.headers_mut().insert(
                axum::http::header::WWW_AUTHENTICATE,
                axum::http::HeaderValue::from_static("Bearer realm=\"api\""),
            );
        }

        // レスポンス生成の共通処理としてサーバー側ログを出力する。
        // 本来ログ出力は副作用なのでここに書くべきではないが、全エラーを漏れなくログに載せるため共通化する。
        // tracing のマクロはレベルがコンパイル時定数である必要があるため、レベルごとに分岐する。
        let LogContext {
            level,
            message: log_message,
            fields,
        } = self.log_context;
        let fields = serde_json::Value::Object(fields);
        let error_code = error_code.to_string();
        let status = status_code.as_u16();
        match level {
            tracing::Level::ERROR => {
                tracing::error!(error_code, status, %fields, "{log_message}")
            }
            tracing::Level::WARN => tracing::warn!(error_code, status, %fields, "{log_message}"),
            tracing::Level::INFO => tracing::info!(error_code, status, %fields, "{log_message}"),
            tracing::Level::DEBUG => tracing::debug!(error_code, status, %fields, "{log_message}"),
            tracing::Level::TRACE => tracing::trace!(error_code, status, %fields, "{log_message}"),
        }

        response
    }
}
