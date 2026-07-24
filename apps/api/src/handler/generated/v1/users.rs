// このファイルは generator/src/generators/api_endpoints.ts から生成されます。
// 直接編集しないでください。

#[allow(unused_imports)]
use crate::error::ApiError;
#[allow(unused_imports)]
use crate::error::AppError;
#[allow(unused_imports)]
use crate::error_code::ErrorCode;
#[allow(unused_imports)]
use crate::extractor::AuthorizedUser;
#[allow(unused_imports)]
use crate::handler_context::RequestContext;
#[allow(unused_imports)]
use crate::model::generated::*;
#[allow(unused_imports)]
use crate::model::id;
#[allow(unused_imports)]
use crate::model::IdResponse;
#[allow(unused_imports)]
use crate::response::{ApiResponse, ApiResult};
#[allow(unused_imports)]
use crate::state::AppState;
#[allow(unused_imports)]
use axum::{
    extract::{Json, Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
};
#[allow(unused_imports)]
use serde::Deserialize;
#[allow(unused_imports)]
use serde_json::json;

pub struct GetMeError {
    error: ApiError,
}

#[allow(dead_code)]
impl GetMeError {
    /// E0005
    pub fn session_expired(log_level: tracing::Level) -> Self {
        Self {
            error: ApiError::new(ErrorCode::SessionExpired, log_level),
        }
    }

    /// クライアントに返すメッセージを設定する
    pub fn with_message<T: Into<String>>(mut self, message: T) -> Self {
        self.error = self.error.with_message(message);
        self
    }

    /// サーバーログに残すメッセージを設定する
    pub fn with_log_message<T: Into<String>>(mut self, message: T) -> Self {
        self.error = self.error.with_log_message(message);
        self
    }

    /// サーバーログに残す追加フィールドを設定する（DBエラー等の詳細を載せる）
    pub fn with_log_fields<K: Into<String>, V: Into<serde_json::Value>>(
        mut self,
        key: K,
        value: V,
    ) -> Self {
        self.error = self.error.with_log_fields(key, value);
        self
    }
}

impl IntoResponse for GetMeError {
    fn into_response(self) -> axum::response::Response {
        self.error.into_response()
    }
}

/// ログイン中のユーザー情報取得
/// アクセストークンに紐づくユーザーの情報を返す
#[allow(dead_code)]
pub async fn get_me(
    auth: AuthorizedUser,
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<ApiResponse<GetMeResponseData>>, GetMeError> {
    let ctx = RequestContext {
        state,
        user: Some(&auth),
        headers,
    };

    crate::handler::handlers::v1::users::get_me(&ctx).await
}
