# admin_api

管理画面（`apps/admin_frontend`）向けの API サーバー。

メンバー向けの `apps/api` とは別クレート・別プロセスとして動作し、ポートは **3001** を使う。
データベースは `apps/api` と同じものを共有する。

## 構成

`apps/api` と同じレイヤードアーキテクチャを採用している。

- **handler**: プレゼンテーション層（リクエストの受け取りとレスポンスの組み立て）
- **service**: ビジネスロジック層（axum の型に依存しない）
- **repository**: 永続化層（`&PgPool` を受け取り SQL を発行する）

依存方向は `handler → service → repository` で、逆方向の依存は禁止。

## 自動生成されるファイル

以下は `generator/src/seed` の定義から `sampleapp local generate` で生成される。直接編集しない。

- `src/error_code.rs` — 管理API固有のエラーコード
- `src/kbn.rs` — 区分値（メンバーAPIと共通）
- `src/model/id.rs` — 管理API固有のエンティティID
- `src/model/generated/` — APIスキーマ
- `src/handler/generated/`, `src/route/generated/` — ルーティングとディスパッチ
- `migrations/test_setup_start.sql` — テスト用DB初期化SQL

## 起動

```sh
sampleapp local start
```

ヘルスチェック:

```sh
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/db
```
