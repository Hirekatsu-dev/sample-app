---
name: api-development
description: Rustバックエンドのレイヤードアーキテクチャ開発規約。ハンドラー、リポジトリ、モデル、エラーハンドリング、テストのパターン。APIのコードを書く・修正するときに参照する。
user-invocable: false
---

# Rust API開発規約

レイヤードアーキテクチャ（kernel → adapter → api → registry）のRust APIの開発規約。

## レイヤー依存関係

```
shared（基盤） ← kernel（ドメイン） ← adapter（インフラ） ← registry（DI） ← api（HTTP）
```

- **kernel**: モデル定義、リポジトリトレイト、サービス（トレイト+実装）。外部依存なし（shared以外）
- **adapter**: リポジトリ実装、DB/S3/メール連携
- **api**: ハンドラー、ルーティング、リクエスト/レスポンス型
- **registry**: DIコンテナ。サービスのみを`Arc<dyn Trait>`で公開（リポジトリはサービスの内部実装詳細）
- **shared**: エラー型、設定、区分値

## ハンドラーパターン

生成されたディスパッチャー (`handler/generated/`) が認証・DIコンテナ抽出を行い、実装ハンドラー (`handler/handlers/`) に委譲する。

```rust
// handler/handlers/v1/user.rs
pub async fn change_password(
    req: UpdateUserPasswordRequestParams,
    ctx: &RequestContext<'_>,
) -> ApiResult<()> {
    // 1. バリデーション
    req.validate(&()).map_err(|_| AppError::UnprocessableEntity("Invalid parameter".into()))?;
    // 2. 認証確認
    let user = ctx.user.ok_or_else(|| AppError::Unauthorized)?;
    // 3. サービス経由でデータ操作（すべての操作はサービス経由）
    ctx.registry.user_service().change_password(event).await?;
    // 4. レスポンス
    render_empty()
}
```

レスポンスヘルパー: `render_data(data)`, `render_empty()`, `render_list(list)`, `render_id(id)`

## リポジトリパターン

### トレイト定義（kernel）
```rust
#[mockall::automock]
#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn find_current_user(&self, id: UserId) -> AppResult<Option<User>>;
    async fn create(&self, event: CreateUser) -> AppResult<User>;
}
```

### 実装（adapter）
```rust
pub struct UserRepositoryImpl { db: ConnectionPool }

#[async_trait]
impl UserRepository for UserRepositoryImpl {
    async fn find_current_user(&self, id: UserId) -> AppResult<Option<User>> {
        let row = sqlx::query_as::<_, UserRow>(r#"SELECT ... FROM users WHERE id = $1"#)
            .bind(id)
            .fetch_optional(self.db.inner_ref())
            .await
            .map_err(AppError::SpecificOperation)?;
        Ok(row.map(User::from))
    }
}
```

**重要**: SQLは必ず`bind()`でパラメータバインド。文字列結合でのSQL組み立て禁止。

## サービスパターン

すべてのハンドラー・エクストラクターはサービス経由でデータ操作を行う。リポジトリはサービスの内部実装詳細であり、ハンドラーから直接利用しない。

各エンティティに対応するサービスを作成する:
- **AuthService**: 認証・ログイン・ログアウト・パスワードリセット・ユーザー登録
- **UserService**: ユーザー情報取得・パスワード変更・プロフィール更新・アカウント削除
- **MediaService**: メディア作成（署名付きURL）・メディア取得
- **ProblemService**: 問題のCRUD・お気に入り・評価・模範解答
- **ProblemAnswerService**: 解答の一覧取得・作成
- **NotificationService**: 通知の一覧取得・既読
- **HealthCheckService**: DBヘルスチェック

### トレイト定義 + 実装（kernel）
サービスは永続化層に直接アクセスしないため、トレイトと実装の両方を kernel に置く。

```rust
// kernel/src/service/auth.rs — ビジネスロジックを含むサービスの例
#[mockall::automock]
#[async_trait]
pub trait AuthService: Send + Sync {
    async fn send_password_reset_email(&self, mail: &str) -> AppResult<()>;
    async fn login(&self, mail: &str, password: &str) -> AppResult<(UserId, AccessToken)>;
    async fn logout(&self, access_token: &AccessToken) -> AppResult<()>;
}

pub struct AuthServiceImpl {
    auth_repository: Arc<dyn AuthRepository>,
    mail_sender: Arc<dyn MailSender>,
    web_base_url: String,
}

// kernel/src/service/notification.rs — リポジトリに委譲するサービスの例
#[mockall::automock]
#[async_trait]
pub trait NotificationService: Send + Sync {
    async fn find_all(&self, event: SearchNotifications) -> AppResult<PaginatedList<Notification>>;
    async fn mark_read(&self, event: MarkNotificationRead) -> AppResult<()>;
}

pub struct NotificationServiceImpl {
    notification_repository: Arc<dyn NotificationRepository>,
}

#[async_trait]
impl NotificationService for NotificationServiceImpl {
    async fn find_all(&self, event: SearchNotifications) -> AppResult<PaginatedList<Notification>> {
        self.notification_repository.find_all(event).await
    }
}
```

### 外部連携トレイト（kernel）
メール送信などの汎用的な外部連携は、リポジトリとは別のトレイトとして定義する。

```rust
// kernel/src/repository/mail_sender.rs
#[mockall::automock]
#[async_trait]
pub trait MailSender: Send + Sync {
    async fn send_email(&self, to: Vec<String>, subject: String, ...) -> Result<String, ...>;
}
```

adapter側で具象型（`MailClient`）にトレイトを実装する。

### ハンドラーからの利用（すべてサービス経由）
```rust
ctx.registry.auth_service().login(&req.email, &req.password).await?;
ctx.registry.user_service().change_password(event).await?;
ctx.registry.notification_service().find_all(event).await?;
```

## モデルパターン

### ドメインモデル（kernel/src/model/）
```rust
pub struct User {
    pub id: UserId,      // NewType ID
    pub name: String,
    pub email: String,
}
```

### イベント（kernel/src/model/*/event.rs）
リポジトリ操作はイベントオブジェクトで表現:
```rust
pub struct CreateUser { pub name: String, pub mail: String, pub password: String }
pub struct UpdateUserPassword { pub user_id: UserId, pub current_password: String, pub new_password: String }
```

### DBモデル（adapter/src/database/model/）
```rust
#[derive(sqlx::FromRow)]
pub struct UserRow { pub id: UserId, pub name: String, ... }

impl From<UserRow> for User {
    fn from(row: UserRow) -> Self { User { id: row.id, name: row.name, ... } }
}
```

## ID型（NewTypeパターン）
`define_id!` マクロで型安全なID型を生成。`UserId`と`ProblemId`は異なる型として扱われ、混同をコンパイル時に検出。

```rust
define_id!(UserId);   // UserId(Uuid)
define_id!(ProblemId); // ProblemId(Uuid)
```

## エラーハンドリング
```rust
// AppError → ApiError → ResultCode → HTTPレスポンス の変換チェーン
AppError::EntityNotFound → ResultCode::NotFound → 404
AppError::Unauthenticated → ResultCode::LoginFailure → 401
AppError::ValidationError → ResultCode::InvalidParameter → 400
```
ハンドラーでは `?` 演算子で伝播。明示的な変換は不要。

## バリデーション
`garde` クレートで宣言的に定義（自動生成される）:
```rust
#[derive(Validate)]
pub struct CreateRequest {
    #[garde(length(min = 1, max = 100))]
    pub name: String,
    #[garde(email)]
    pub mail: String,
}
```

## テストパターン
```rust
#[cfg(test)]
mod tests {
    use crate::test_helper::helper::{create_user, setup_postgres, UserBuilder};

    #[tokio::test]
    async fn test_find_user() -> Result<()> {
        let pool = setup_postgres().await;          // テストDB初期化
        let user = UserBuilder::default().build()?; // テストデータ構築
        create_user(pool.inner_ref(), &user).await?; // DB投入
        let repo = UserRepositoryImpl::new(pool);
        let found = repo.find_current_user(UserId::from(user.id)).await?;
        assert!(found.is_some());
        Ok(())
    }
}
```

**重要**: adapter層テストは `--test-threads=1` が必要（共有テストDB）。

## 区分値（Kbn）
自動生成される`shared::kbn`のEnumを使用。`strum::EnumString`で文字列パース可能。
```rust
use shared::kbn::MediaType;
let mt = MediaType::from_str("03001")?; // → MediaType::ProblemImage
```

## 自動生成ファイル（直接編集禁止）
- `api/src/model/generated/*.rs` — リクエスト/レスポンス型
- `api/src/handler/generated/*.rs` — ハンドラーディスパッチ
- `api/src/route/generated/*.rs` — ルート定義
- `shared/src/kbn.rs` — 区分値
- `shared/src/error_code.rs` — エラーコード
- `kernel/src/model/id.rs` — エンティティID

**手動実装が必要なファイル**:
- `api/src/handler/handlers/` — ハンドラー実装（スタブは初回のみ生成）
- `api/src/model/*.rs` — From/Into変換の実装
- `kernel/src/model/` — ドメインモデル
- `kernel/src/repository/` — リポジトリトレイト
- `kernel/src/service/` — サービス（トレイト+実装）
- `adapter/src/repository/` — リポジトリ実装
- `adapter/src/database/model/` — DBモデル（Row構造体）
