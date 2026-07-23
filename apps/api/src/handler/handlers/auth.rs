use axum::Json;
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use garde::Validate;

use crate::error::AppError;
use crate::handler::generated::auth::{LoginError, LogoutError};
use crate::handler_context::RequestContext;
use crate::model::generated::{PostLoginRequestParams, PostLoginResponseData};
use crate::response::{render_data, render_empty, ApiResponse};
use crate::service;

/// ユーザーログイン
/// メールアドレスとパスワードでログインする
pub async fn login(
    req: PostLoginRequestParams,
    ctx: &RequestContext<'_>,
    jar: CookieJar,
) -> Result<(CookieJar, Json<ApiResponse<PostLoginResponseData>>), LoginError> {
    req.validate(&())
        .map_err(|_| LoginError::invalid_parameter(tracing::Level::WARN))?;

    let (user_id, access_token) = service::auth::login(&ctx.state, &req.email, &req.password)
        .await
        .map_err(|e| match e {
            AppError::Unauthenticated | AppError::Unauthorized => {
                LoginError::login_failure(tracing::Level::WARN)
            }
            other => LoginError::invalid_parameter(tracing::Level::ERROR)
                .with_log_fields("error", format!("{other:?}")),
        })?;

    let response = PostLoginResponseData {
        user_id,
        access_token: access_token.0.clone(),
    };

    // アクセストークンは httpOnly Cookie に載せる。
    let cookie = Cookie::build(("access_token", access_token.0))
        .http_only(true)
        .same_site(SameSite::Strict)
        .path("/")
        .build();
    let jar = jar.add(cookie);

    Ok((jar, render_data(response)?))
}

/// ユーザーログアウト
/// ログアウトしてセッションを破棄する
pub async fn logout(
    ctx: &RequestContext<'_>,
    jar: CookieJar,
) -> Result<(CookieJar, Json<ApiResponse<()>>), LogoutError> {
    let user = ctx
        .user
        .ok_or_else(|| LogoutError::session_expired(tracing::Level::WARN))?;

    service::auth::logout(&ctx.state, &user.access_token)
        .await
        .map_err(|e| {
            LogoutError::session_expired(tracing::Level::ERROR)
                .with_log_fields("error", format!("{e:?}"))
        })?;

    let jar = jar.remove(Cookie::from("access_token"));

    Ok((jar, render_empty()?))
}
