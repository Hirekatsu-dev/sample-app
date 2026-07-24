# スコープ01: 管理者認証と管理画面の基盤

## 目的

管理画面を成立させるための土台を用意する。管理者アカウントの概念を導入し、管理者がログイン・ログアウトできる状態にする。

## 対象要件

- 管理者はメールアドレスとパスワードでログインできる
- 管理者はログアウトできる

## 前提スコープ

なし（メンバー認証の実装を参考にする）

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| entity_ids | `AdminId`, `AdminSessionId` |
| entities | `admin`（`id` / `name` / `email` / `password`） |
| tables | `admins`（`email` にユニークインデックス）、`admin_sessions`（`admin_id` 外部キー、`token_code`、`expires_at`） |
| errors | 管理API用のエラーコード定義（`generator/src/seed/errors/difinitions/admin.ts`） |
| api_schemas | `AdminLoginRequest`, `GetAdminMeResponseData` |
| api_endpoints | 管理API（`admin_api`）グループを新設し、`POST /admin/auth/login`、`POST /admin/auth/logout`、`GET /admin/v1/admins/me` |
| pages | `AdminLogin`（`/admin/login`、認証不要）、`AdminHome`（`/admin`、認証必要） |

### API

- `apps/api/src/repository/admin_auth.rs` / `admin.rs`: 管理者の取得、セッションの発行・削除
- `apps/api/src/service/admin_auth.rs`: パスワード検証（bcrypt）、セッション発行、ログアウト
- `apps/api/src/extractor.rs`: 管理者セッション用のExtractorを追加する
  - メンバーのセッションCookieと管理者のセッションCookieは別名にし、相互に流用できないようにする

### フロントエンド

- 管理画面用のレイアウトコンポーネント（ヘッダー・サイドナビ）を追加する
- ログイン画面はメンバー画面のログイン画面の構造に合わせる
- Storybookストーリーを作成する

## テスト

- ログイン成功／パスワード不一致／存在しないメールアドレス
- ログアウト後にセッションが失効していること
- メンバーのセッションCookieで管理APIを呼べないこと
- 期限切れセッションでのアクセス

## 完了条件

- 管理者がログインして管理画面のホームを表示でき、ログアウトできる
- `sampleapp local generate` の生成物が最新化されている
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **管理者テーブルを分けるか**: 本ドキュメントでは `users` とは別の `admins` テーブルとしている。管理者とメンバーは所属も権限体系も異なり、`users` にロール区分を持たせるとワークスペース所属の扱いが複雑になるため。
- **管理者アカウントの作成手段**: 管理者の登録画面は要件にない。初期データ投入用のSQL（`db/sql` のシード）で作成する想定とする。
