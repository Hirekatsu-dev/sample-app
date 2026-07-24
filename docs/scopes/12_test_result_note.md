# スコープ12: 実行結果へのコメント・添付ファイル

## 目的

実行結果に対する補足のやり取りと、スクリーンショットなどの証跡の添付をできるようにする。ファイルストレージの基盤をここで導入する。

## 対象要件

- ユーザーは実行結果にコメントを追加できる
- ユーザーは実行結果に画像などのファイルを添付できる

## 前提スコープ

- 11 実行結果の記録と進捗表示

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| entity_ids | `TestResultCommentId`, `AttachmentId` |
| entities | `test_result_comment`（`id` / `test_result_id` / `posted_user_id` / `content` / `posted_at`）、`attachment`（`id` / `workspace_id` / `test_result_id` / `filename` / `content_type_code` / `size_count` / `storage_key_code` / `uploaded_user_id`） |
| tables | `test_result_comments`、`attachments` |
| api_schemas | `TestResultComment`, `CreateTestResultCommentRequest`, `UpdateTestResultCommentRequest`, `AttachmentSummary` |
| api_endpoints | `GET/POST /v1/test_results/{test_result_id}/comments`、`PUT/DELETE /v1/test_result_comments/{comment_id}`、`GET/POST /v1/test_results/{test_result_id}/attachments`、`GET /v1/attachments/{attachment_id}/content`（ダウンロード）、`DELETE /v1/attachments/{attachment_id}` |
| errors | ファイルサイズの上限超過、許可されていないファイル形式、添付件数の上限超過、他ユーザーのコメントの編集・削除 |

### API

- `repository/test_result_comment.rs`, `repository/attachment.rs` を追加する
- `service/test_result_comment.rs`
  - コメントの編集・削除は投稿者本人のみ許可する
- `service/attachment.rs`
  - アップロードはマルチパートで受け取る
  - 拡張子ではなく実際の内容からMIMEタイプを判定し、許可リスト（画像 `image/png`・`image/jpeg`・`image/gif`、`application/pdf`、`text/plain`、`text/csv`）と照合する。ブラウザ上で実行され得る `image/svg+xml` や `text/html` は許可しない
  - ファイルサイズと1結果あたりの添付件数に上限を設ける
  - 保存キーはUUIDで採番し、元のファイル名はDBにのみ保持する（パス操作による問題を避ける）
  - ダウンロードは、対象が利用中のワークスペースに属することを検証したうえで配信する
  - ダウンロードのレスポンスには `Content-Disposition: attachment`（元のファイル名を付与）と `X-Content-Type-Options: nosniff` を必ず付ける。添付は同一オリジンで配信するため、上記の許可MIMEタイプ制限とあわせてブラウザ上でのスクリプト実行を防ぐ
  - 削除は論理削除とし、実体ファイルは残す
- ストレージ抽象（`service/storage.rs`）を追加し、保存先の実装を差し替えられるようにする

### フロントエンド

- 実行結果の履歴にコメント欄を追加する（投稿・編集・削除）
- 添付のアップロード（ドラッグ＆ドロップとファイル選択）、画像のサムネイル表示、削除
- アップロード中・失敗時の表示
- Storybookストーリーを作成する

## テスト

- コメントの投稿・編集・削除、本人以外による編集・削除がエラーになること
- 添付のアップロードとダウンロード
- サイズ上限超過、許可外の形式、件数上限超過がエラーになること
- 他ワークスペースの添付をダウンロードできないこと

## 完了条件

- 実行結果に対してコメントと添付ファイルを扱える
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **保存先**: 開発環境ではコンテナ内のローカルボリュームに保存する実装を既定にする。S3互換（MinIO）を compose に追加するかは、実装時にストレージ抽象の差し替えで判断する。認証情報をコードに含めない点に注意する。
- **ウイルススキャン**: 導入しない。サンプルアプリの範囲外とし、許可するファイル形式とサイズの制限で対応する。
- **添付の対象**: 添付先は実行結果のみとする。不具合（スコープ13）への直接添付は行わず、起票元の実行結果の添付を参照する。
