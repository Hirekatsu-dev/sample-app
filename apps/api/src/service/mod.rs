//! ビジネスロジックを担う。
//!
//! handler からリクエストの内容を受け取り、repository を組み合わせて処理する。
//! axum の型（`State` や `Json` など）には依存させない。

pub mod auth;
pub mod health_check;
pub mod user;
