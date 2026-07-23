---
description: 新しいAPIエンドポイントを追加する。seed定義からコード生成、ハンドラー実装までのワークフローを実行する。
argument-hint: "[エンドポイントの概要（例: タグのCRUD）]"
disable-model-invocation: true
---

新しいAPIエンドポイントを追加してください。

## 引数
$ARGUMENTS にエンドポイントの概要が指定されます。（例: 「タグのCRUD」「お気に入り追加・削除」）

## 手順

### 1. 要件の確認
- $ARGUMENTS の内容から、必要なエンドポイント（GET/POST/PUT/DELETE等）を洗い出す
- 既存の類似エンドポイントを参考にする（`generator/src/seed/api_endpoints/definitions/member_api/` を確認）

### 2. エンティティIDの追加（必要な場合）
- `generator/src/seed/entity_ids/index.ts` に新しいエンティティIDを追加
- 既存のIDと重複しないこと

### 3. 区分値の追加（必要な場合）
- `generator/src/seed/kbns/index.ts` に新しい区分値を追加

### 4. APIスキーマの定義
- `generator/src/seed/api_schemas/definitions/member_api/` に新しいファイルを作成
- 命名規則:
  - リクエスト: `{Action}{Resource}RequestParams`
  - レスポンス（単一）: `{Action}{Resource}ResponseData`
  - レスポンス（リスト）: `{Action}{Resource}ResponseListItem`
- 既存ファイル（problems.ts, users.ts等）をパターンとして参照
- `generator/src/seed/api_schemas/definitions/member_api/index.ts` にexportを追加

### 5. APIエンドポイントの定義
- `generator/src/seed/api_endpoints/definitions/member_api/` に新しいファイルを作成
- レスポンスのschemaパターン:
  - 単一データ: `{ type: 'data', dataSchema: 'SchemaName' }`
  - リスト: `{ type: 'list', itemSchema: 'SchemaName' }`
  - UUID返却: `{ type: 'id', entityId: 'EntityIdName' }`
- `generator/src/seed/api_endpoints/definitions/member_api/index.ts` にexportを追加

### 6. コード生成
```bash
sampleapp local generate
```

### 7. 生成結果の確認
以下が自動生成される:
- `apps/api/api/src/model/generated/` — Rustリクエスト/レスポンス型
- `apps/api/api/src/handler/generated/` — Rustハンドラーディスパッチ
- `apps/api/api/src/handler/handlers/` — Rustハンドラースタブ（**新規の場合のみ**生成、既存は上書きしない）
- `apps/api/api/src/route/generated/` — Rustルート定義
- `apps/frontend/src/api/generated_api.ts` — TypeScript APIクライアント
- `docs/open_api/` — OpenAPIスキーマ

### 8. バックエンドハンドラーの実装
- `apps/api/api/src/handler/handlers/` の生成されたスタブにビジネスロジックを実装
- 必要に応じてkernel層にリポジトリトレイトを追加
- adapter層にリポジトリ実装を追加

### 9. 品質チェック
```bash
sampleapp local lint all
sampleapp local test api
```

## 注意事項
- 自動生成ファイル（ファイル先頭にコメントあり）は直接編集しない
- ハンドラースタブ（`handlers/`）は既存ファイルが存在する場合は上書きされないため、手動で追加が必要
- APIスキーマのプロパティには `validation` を適切に設定する（`length`, `range` 等）
