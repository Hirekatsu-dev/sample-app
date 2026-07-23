use axum::async_trait;
use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum::RequestPartsExt;
use axum_extra::extract::CookieJar;

use crate::error::{ApiError, AppError};
use crate::model::auth::AccessToken;
use crate::model::user::User;
use crate::service;
use crate::state::AppState;

/// 認証済みユーザーを表す extractor。
///
/// Cookie の `access_token` を検証し、対応するユーザーを解決する。
/// ハンドラの引数に指定すると、認証が必須のエンドポイントになる。
pub struct AuthorizedUser {
    pub access_token: AccessToken,
    pub user: User,
}

#[async_trait]
impl FromRequestParts<AppState> for AuthorizedUser {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        // Cookie からアクセストークンを取り出す
        let jar = parts
            .extract::<CookieJar>()
            .await
            .map_err(|_| AppError::Unauthorized)?;
        let token = jar
            .get("access_token")
            .map(|cookie| cookie.value().to_string())
            .ok_or(AppError::Unauthorized)?;
        let access_token = AccessToken(token);

        // トークンからユーザー ID を引く
        let user_id = service::auth::verify_token(state, &access_token)
            .await?
            .ok_or(AppError::Unauthenticated)?;

        // ユーザー ID からユーザーを引く
        let user = service::user::find_current_user(state, user_id)
            .await?
            .ok_or(AppError::Unauthenticated)?;

        Ok(Self { access_token, user })
    }
}
