# user_sessions

[← ER図に戻る](../er-diagram.md)

このファイルは generator/src/generators/tables.ts から生成されます。
直接編集しないでください。

ユーザーのログインセッションを管理するテーブル

## カラム一覧

| 物理名 | 論理名 | 型 | NOT NULL | デフォルト値 | 説明 |
|--------|--------|-----|----------|-------------|------|
| id | ID | UUID | ✓ | gen_random_uuid() |  |
| user_id | ID | UUID | ✓ | gen_random_uuid() | セッションに紐づくユーザーのID |
| access_token_code | アクセストークン_コード | TEXT | ✓ | '' | API認証用のトークン |
| expire_at | 失効_日時 | TIMESTAMPTZ | ✓ | NOW() | セッションの有効期限 |
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
| idx_user_sessions_access_token_code | access_token_code | ✓ | btree |

## 外部キー制約

| カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
|--------|----------------|--------------|-----------|-----------|
| user_id | [users](./users.md) | id | SET NULL | RESTRICT |
