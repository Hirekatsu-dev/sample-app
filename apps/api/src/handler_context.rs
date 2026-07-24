use axum::http::HeaderMap;

use crate::extractor::AuthorizedUser;
use crate::state::AppState;

/// 生成されたディスパッチ層から手書きハンドラへ渡す共通コンテキスト。
///
/// `user` は認証必須のエンドポイントでのみ `Some` になる。
pub struct RequestContext<'a> {
    pub state: AppState,
    pub user: Option<&'a AuthorizedUser>,
    #[allow(dead_code)]
    pub headers: HeaderMap,
}
