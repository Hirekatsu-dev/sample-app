# スコープ01: 管理者認証

## 目的

管理者アカウントの概念を導入し、管理者が管理画面にログイン・ログアウトできる状態にする。

管理画面のアプリケーション（`apps/admin_api` / `apps/admin_frontend`）そのものは基盤整備のPRで作成済みで、現状はヘルスチェックのみが動く。このスコープで認証を載せる。

## 対象要件

- 管理者はメールアドレスとパスワードでログインできる
- 管理者はログアウトできる

## 前提スコープ

なし（アプリケーション分離の基盤整備が完了していること。メンバー認証の実装 `apps/api` を参考にする）

## 実施内容

### seed定義

管理画面向けの定義は admin ターゲット側に追加する（`generator/src/generators/targets.ts` 参照）。

| 種別 | 追加するもの |
| --- | --- |
| entity_ids | `adminEntityIds` に `AdminId`, `AdminSessionId` を追加 |
| entities | `admin`（`id` / `name` / `email` / `password`） |
| tables | `admins`（`email` にユニークインデックス）、`admin_sessions`（`admin_id` 外部キー、`token_code`、`expires_at`） |
| errors | `errors/difinitions/admin.ts` に認証系のエラーを追加（共通エラーは基盤整備で定義済み） |
| api_schemas | `definitions/admin_api/` に `AdminLoginRequest`, `GetAdminMeResponseData` |
| api_endpoints | `definitions/admin_api/` に auth グループ（`POST /api/auth/login`、`POST /api/auth/logout`）と v1/admins グループ（`GET /api/v1/admins/me`） |
| pages | admin に `AdminLogin`（`/login`、認証不要）。既存の `AdminHome`（`/`）を認証必須に変更する |

管理APIは別サーバー（ポート3001）のため、パスに `/admin` プレフィックスは付けない。

### API（apps/admin_api）

- `src/model/admin.rs`, `src/model/auth.rs`: 管理者とアクセストークンのモデル
- `src/repository/admin_auth.rs`, `src/repository/admin.rs`: 管理者の取得、セッションの発行・削除
- `src/service/admin_auth.rs`, `src/service/admin.rs`: パスワード検証（bcrypt）、セッション発行、ログアウト
- `src/extractor.rs`（新規）: 管理者セッションを解決する Extractor
- `src/handler_context.rs`（新規）: 生成されたディスパッチ層へ渡す `RequestContext`
- `src/handler/handlers/`: 生成されたスタブに実装を入れる

セッションCookieはメンバーAPIと別名（例: `admin_access_token`）にする。別ポートでもCookieはホスト単位で共有されうるため、名前を分けて取り違えを防ぐ。

### フロントエンド（apps/admin_frontend）

- ログイン画面（メールアドレス・パスワード）
- 未認証時にログイン画面へ遷移させるルーターガード
- ログイン後のヘッダー（ログアウト導線）
- 必要なUIコンポーネントは `apps/frontend/src/components/ui` から必要な分だけ移植する（admin_frontend は最小構成で作成しているため）

## テスト

- ログイン成功／パスワード不一致／存在しないメールアドレス
- ログアウト後にセッションが失効していること
- メンバーAPIのセッションCookieで管理APIを呼べないこと
- 期限切れセッションでのアクセス

## 完了条件

- 管理者がログインして管理画面のホームを表示でき、ログアウトできる
- `sampleapp local generate` の生成物が最新化されている
- `sampleapp local lint all` と `sampleapp local test admin-api` が通る

## 判断が必要な点

- **管理者テーブルを分けるか**: 本ドキュメントでは `users` とは別の `admins` テーブルとしている。管理者とメンバーは所属も権限体系も異なり、`users` にロール区分を持たせるとワークスペース所属の扱いが複雑になるため。
- **管理者アカウントの作成手段**: 管理者の登録画面は要件にない。初期データ投入用のSQL（`db/sql` のシード）で作成する想定とする。
