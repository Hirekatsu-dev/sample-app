use axum::Json;

use crate::handler::generated::v1::users::GetMeError;
use crate::handler_context::RequestContext;
use crate::model::generated::GetMeResponseData;
use crate::response::{render_data, ApiResponse};

/// ログイン中のユーザー情報取得
/// アクセストークンに紐づくユーザーの情報を返す
pub async fn get_me(
    ctx: &RequestContext<'_>,
) -> Result<Json<ApiResponse<GetMeResponseData>>, GetMeError> {
    let user = ctx
        .user
        .ok_or_else(|| GetMeError::session_expired(tracing::Level::WARN))?;

    let data = GetMeResponseData {
        id: user.user.id,
        name: user.user.name.clone(),
        email: user.user.email.clone(),
    };

    render_data(data)
}
