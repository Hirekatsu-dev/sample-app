# users

[← ER図に戻る](../er-diagram.md)

このファイルは generator/src/generators/tables.ts から生成されます。
直接編集しないでください。

ユーザー

## カラム一覧

| 物理名 | 論理名 | 型 | NOT NULL | デフォルト値 | 説明 |
|--------|--------|-----|----------|-------------|------|
| id | ID | UUID | ✓ | gen_random_uuid() |  |
| name | 名前 | TEXT | ✓ | '' | ユーザーの表示名 |
| email | Eメール | TEXT | ✓ | '' | ログイン用メールアドレス |
| password | パスワード | TEXT | ✓ | '' | bcryptでハッシュ化されたパスワード |
| created_at | 日時 | TIMESTAMPTZ | ✓ | NOW() |  |
| updated_at | 日時 | TIMESTAMPTZ | ✓ | NOW() |  |
| deleted_at | 日時 | TIMESTAMPTZ |  | NULL |  |
| created_id | ID | UUID | ✓ | gen_random_uuid() |  |
| updated_id | ID | UUID | ✓ | gen_random_uuid() |  |
| deleted_id | ID | UUID |  | gen_random_uuid() |  |
| meta_json | JSON | JSONB | ✓ | '{}' |  |

## 主キー

- id

## インデックス

| 名前 | カラム | ユニーク | 種類 |
|------|--------|----------|------|
| idx_users_email | email | ✓ | btree |
