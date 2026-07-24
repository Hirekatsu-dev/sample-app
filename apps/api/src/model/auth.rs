/// API 認証用のアクセストークン。
///
/// 値は `user_sessions.access_token_code` に保存される不透明な文字列。
pub struct AccessToken(pub String);
