---
description: 新しいテーブルを追加する。seed定義からコード生成、マイグレーション作成、リポジトリ実装までのワークフローを実行する。
argument-hint: "[テーブルの概要（例: お気に入りテーブル）]"
disable-model-invocation: true
---

新しいテーブルを追加してください。

## 引数
$ARGUMENTS にテーブルの概要が指定されます。（例: 「お気に入りテーブル（ユーザーと問題の多対多）」）

## 手順

### 1. 要件の確認
- $ARGUMENTS の内容から、テーブル構造（カラム、外部キー、インデックス）を設計する
- 既存テーブル定義を参考にする（`generator/src/seed/tables/definitions/` を確認）

### 2. エンティティIDの追加（必要な場合）
- `generator/src/seed/entity_ids/index.ts` に新しいエンティティIDを追加

### 3. 区分値の追加（必要な場合）
- `generator/src/seed/kbns/index.ts` に新しい区分値を追加

### 4. テーブル定義の作成
- `generator/src/seed/tables/definitions/` に新しいファイルを作成

#### ドメイン型リファレンス
| ドメイン | 物理名サフィックス | PostgreSQL型 | 用途 |
|----------|-------------------|-------------|------|
| `UUID` | `_uuid` | `uuid` | 主キー、外部キー |
| `名前` | `_name` | `TEXT` | 名前 |
| `タイトル` | `_title` | `TEXT` | タイトル |
| `メール` | `_email` | `TEXT` | メールアドレス |
| `内容` | `_content` | `TEXT` | 長文テキスト |
| `コード` | `_code` | `TEXT` | 短いコード値 |
| `ダイジェスト` | `_digest` | `TEXT` | ハッシュ値 |
| `URL` | `_url` | `TEXT` | URL |
| `説明` | `_description` | `TEXT` | 説明文 |
| `フラグ` | `_flag` | `TEXT` | フラグ値 |
| `数` | `_count` | `count` | 数値 |
| `日時` | `_at` | `TIMESTAMPTZ` | タイムスタンプ |
| `JSON` | `_json` | `JSONB` | JSONデータ |
| `区分` | `_kbn` | `TEXT` | 区分値（`kbn`プロパティ必須） |

#### 自動付与されるシステムカラム
以下は定義不要（自動で追加される）:
- `created_at`, `updated_at`, `deleted_at`
- `created_uuid`, `updated_uuid`, `deleted_uuid`
- `meta_json`

#### テーブル定義の例
```typescript
import { defineTable } from '../base';
import { defineForeignKey, referencesTable } from '../foreign_key_helpers';

export const favoritesTable = defineTable({
  name: 'favorites',
  description: 'お気に入り',
  columns: [
    { domain: 'UUID' },  // -> uuid (主キー)
    { pname: 'user', domain: 'UUID' },  // -> user_uuid (外部キー)
    { pname: 'problem', domain: 'UUID' },  // -> problem_uuid (外部キー)
  ] as const,
  primaryKeys: ['uuid'],
  indices: [
    { columns: ['user_uuid'] },
    { columns: ['problem_uuid'] },
  ],
});

export const favoritesTableForeignKeys = [
  defineForeignKey({
    sourceTable: 'favorites',
    columns: ['user_uuid'],
    ...referencesTable('users', ['uuid'], {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
      relationship: 'one-to-many',
    }),
  }),
  defineForeignKey({
    sourceTable: 'favorites',
    columns: ['problem_uuid'],
    ...referencesTable('problems', ['uuid'], {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
      relationship: 'one-to-many',
    }),
  }),
];
```

### 5. テーブル定義の登録
- `generator/src/seed/tables/index.ts` にテーブルと外部キーのimport/exportを追加

### 6. コード生成
```bash
sampleapp local generate
```

### 7. 生成結果の確認
以下が自動生成される:
- `db/sql/tables/{table_name}.sql` — テーブル定義DDL
- `db/sql/foreign_keys/{table_name}.sql` — 外部キー制約DDL
- `apps/api/adapter/migrations/test_setup_start.sql` — テスト用DB初期化SQL
- `docs/database/er-diagram.md` — ER図
- `docs/database/tables/{table_name}.md` — テーブルドキュメント

### 8. マイグレーションSQLの作成
- `db/sql/migrations/manual/` にマイグレーションファイルを作成
- ファイル名: `YYYYMMDD_{description}.sql`（例: `20260209_create_favorites.sql`）
- 生成されたDDL（`db/sql/tables/` と `db/sql/foreign_keys/`）を参考にCREATE TABLE文を記述

### 9. 開発環境への適用
```bash
# テーブルを全初期化する場合
sampleapp local prepare

# マイグレーションのみ適用する場合
# db/sql/migrations/cd/scripts/migrate.sh を実行
```

### 10. バックエンド実装
- `apps/api/kernel/src/model/` にモデルを追加
- `apps/api/kernel/src/repository/` にリポジトリトレイトを追加
- `apps/api/adapter/src/repository/` にリポジトリ実装を追加
- `apps/api/adapter/src/database/model/` にDBモデル（Row構造体）を追加

### 11. 品質チェック
```bash
sampleapp local lint all
sampleapp local test api
```

## 注意事項
- 自動生成ファイルは直接編集しない
- PostgreSQLは外部キーに自動でインデックスを作成しないため、`indices` に明示的に追加する
- 外部キーの参照先テーブルが存在することを確認する
