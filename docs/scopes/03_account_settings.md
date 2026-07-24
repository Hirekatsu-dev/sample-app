# スコープ03: アカウント設定とパスワード再発行

## 目的

管理者・メンバーの双方が、自分のメールアドレスとパスワードを変更でき、パスワードを忘れた場合に再設定できるようにする。あわせてメール送信の基盤を用意する（招待機能で再利用する）。

## 対象要件

- 管理者はログイン中にメールアドレス・パスワードを変更できる
- 管理者はパスワード忘れからパスワードを再発行できる
- ユーザーはログイン中にメールアドレス・パスワードを変更できる
- ユーザーはパスワード忘れからパスワードを再発行できる

## 前提スコープ

- 01 管理者認証と管理画面の基盤

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| entity_ids | `PasswordResetId` |
| tables | `password_resets`（`target_kbn` / `target_id` / `token_code` / `expires_at` / `used_at`）※`token_code` はハッシュ化して保存する |
| kbns | `password_reset_target`（`admin`: 管理者 / `user`: ユーザー） |
| api_schemas | `UpdateEmailRequest`, `UpdatePasswordRequest`, `RequestPasswordResetRequest`, `CompletePasswordResetRequest` |
| api_endpoints | メンバーAPI（`apps/api`）: `PUT /api/v1/users/me/email`、`PUT /api/v1/users/me/password`、`POST /api/auth/password_reset`、`POST /api/auth/password_reset/complete`。管理API（`apps/admin_api`）: `PUT /api/v1/admins/me/email`、`PUT /api/v1/admins/me/password`、`POST /api/auth/password_reset`、`POST /api/auth/password_reset/complete` |
| errors | 現在のパスワード不一致、メールアドレスの重複、トークンの無効・期限切れ・使用済み |
| pages | `AccountSetting`、`PasswordResetRequest`、`PasswordResetComplete`、および管理画面版の同等ページ |

### API

- `repository/password_reset.rs` を追加する
- `service/account.rs`
  - メールアドレス変更時は現在のパスワードによる本人確認を行う
  - パスワード変更時は現在のパスワードを検証し、変更後に自分以外のセッションを失効させる
- `service/password_reset.rs`
  - 再発行の申請では、メールアドレスが存在するかどうかに関わらず同じレスポンスを返す（アカウントの存在を推測させない）
  - トークンは有効期限付き・1回限りとし、使用時に `used_at` を記録する
  - 完了時に対象アカウントの既存セッションをすべて失効させる
- メール送信の共通モジュール（`service/mailer.rs`）を追加する

### フロントエンド

- アカウント設定画面（メールアドレス変更フォーム、パスワード変更フォーム）
- パスワード再発行の申請画面と、トークン付きURLから遷移する再設定画面
- Storybookストーリーを作成する

## テスト

- メールアドレス変更（成功 / パスワード不一致 / 重複）
- パスワード変更（成功 / 現在のパスワード不一致 / 変更後に旧セッションが失効すること）
- パスワード再発行（正常系 / 期限切れトークン / 使用済みトークン / 不正なトークン）
- 存在しないメールアドレスへの申請でもレスポンスが変わらないこと

## 完了条件

- 管理者・メンバーの双方でメールアドレスとパスワードの変更、パスワード再発行ができる
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **メール送信の実現方法**: 開発環境では実際の外部送信を行わず、Mailpit などのローカルSMTPへ送信するアダプタを既定にする（compose に追加する）。ログには送信メタデータ（宛先・件名・種別）のみを記録し、パスワード再設定URL・トークン、およびスコープ04の招待トークンは本文ごとログへ出力しない。public リポジトリのため実在するドメイン・アカウントは使わない。
- **メールアドレス変更時の確認メール**: 新アドレスへの確認メールによる二段階確認は行わず、パスワード確認のみで即時反映する（要件に確認手順の記載がないため）。必要になった時点で追加する。
- **管理者とメンバーの共通化**: `password_resets` は対象種別を区分値で持ち、テーブルを1つに統一する。
