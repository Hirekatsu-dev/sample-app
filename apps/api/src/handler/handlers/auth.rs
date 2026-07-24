use axum::Json;
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use garde::Validate;

use crate::env::{which, Environment};
use crate::error::AppError;
use crate::handler::generated::auth::{LoginError, LogoutError};
use crate::handler_context::RequestContext;
use crate::model::generated::{PostLoginRequestParams, PostLoginResponseData};
use crate::response::{render_data, render_empty, ApiResponse};
use crate::service;

/// アクセストークンを載せる Cookie を組み立てる。
///
/// httpOnly + SameSite=Strict とし、本番（HTTPS）では Secure を付ける。
fn build_access_token_cookie(token: String) -> Cookie<'static> {
    Cookie::build(("access_token", token))
        .http_only(true)
        .same_site(SameSite::Strict)
        .path("/")
        .secure(matches!(which(), Environment::Production))
        .build()
}

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
            // 認証の失敗はクライアント起因なので 401 を返す
            AppError::Unauthenticated | AppError::Unauthorized => {
                LoginError::login_failure(tracing::Level::WARN)
            }
            // それ以外（DB エラー等）はサーバー起因なので 5xx を返す
            other => LoginError::unknown(tracing::Level::ERROR)
                .with_log_fields("error", format!("{other:?}")),
        })?;

    // アクセストークンは httpOnly Cookie でのみ返し、レスポンスボディには含めない。
    let response = PostLoginResponseData { user_id };
    let jar = jar.add(build_access_token_cookie(access_token.0));

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
            LogoutError::unknown(tracing::Level::ERROR).with_log_fields("error", format!("{e:?}"))
        })?;

    // Cookie の削除は付与時と同じ path を指定しないとブラウザが一致とみなさない。
    let mut removal = Cookie::from("access_token");
    removal.set_path("/");
    let jar = jar.remove(removal);

    Ok((jar, render_empty()?))
}
