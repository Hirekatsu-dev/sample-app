---
name: system-design
description: SampleAppプロジェクトの全体アーキテクチャ。ディレクトリ構成、コード生成パイプライン、DBスキーマ設計、Docker構成、設計原則。プロジェクト構造の理解や新機能追加の計画時に参照する。
user-invocable: false
---

# システム設計ガイド

SampleAppプロジェクトの全体アーキテクチャと設計方針。

## プロジェクト構成

```
sample_app/
├── apps/
│   ├── api/           # Rust APIサーバー（レイヤードアーキテクチャ: kernel [service含む] → adapter → registry → api）
│   ├── frontend/      # Vue 3 + TypeScript フロントエンド
│   └── tex_to_pdf/    # LaTeX→PDF変換サービス
├── generator/         # TypeScript製コード生成システム
│   └── src/seed/      # 定義ファイル群（テーブル、API、区分値等）
├── db/                # SQL定義、マイグレーション、初期化スクリプト
├── cli/               # sampleapp CLIツール（Bash製）
├── infra/cdk/         # AWS CDK インフラ定義
├── docs/              # 自動生成ドキュメント（ER図、API仕様等）
├── local_ses/         # ローカルメールサーバー
└── s3/                # ローカルS3設定
```

## コード生成中心の設計

定義ファイル（TypeScript）を唯一のソースとし、フロントエンド・バックエンド・DB・ドキュメントを一括生成する。

### 生成パイプライン（`sampleapp local generate`）

```
seed定義 → generateTables()      → DDL, テスト用SQL, ER図
         → generateKbns()        → TS/Rust区分値Enum
         → generateErrors()      → TS/Rustエラーコード
         → generateApiSchemas()  → TS/Rust型定義, OpenAPIスキーマ
         → generateEntityIds()   → RustのNewType ID
         → generateApiEndpoints()→ ルート, ハンドラースタブ, APIクライアント, OpenAPIパス
         → generatePages()       → EntryPoint, ルート定義, 画面遷移図
```

### 定義ファイルの場所

| 種類 | 場所 | 変更が影響するもの |
|------|------|-------------------|
| テーブル | `generator/src/seed/tables/definitions/` | DDL, テストSQL, ER図 |
| 区分値 | `generator/src/seed/kbns/index.ts` | TS/Rust Enum, DB関数 |
| エラーコード | `generator/src/seed/errors/` | TS/Rust ResultCode |
| APIスキーマ | `generator/src/seed/api_schemas/definitions/` | TS/Rust型, OpenAPI |
| エンドポイント | `generator/src/seed/api_endpoints/definitions/` | ルート, ハンドラー, APIクライアント |
| エンティティID | `generator/src/seed/entity_ids/index.ts` | Rust ID型 |
| ページ | `generator/src/seed/pages/definitions/` | EntryPoint, ルート, 画面遷移図 |

## DBスキーマ設計

### Source/Public/Garbage 三層スキーマ
PostgreSQLの継承機能を使った論理削除パターン:

```sql
-- source: 構造定義（データなし）
CREATE TABLE source.users (...);
-- public: 有効データ（アプリから参照）
CREATE TABLE public.users () INHERITS (source.users);
-- garbage: 論理削除データ
CREATE TABLE garbage.users () INHERITS (source.users);
```

- クエリ時は `public.テーブル名` を参照（publicは省略可）
- 論理削除時にpublicからgarbageへ移動

### システムカラム（全テーブルに自動付与）
`created_at`, `updated_at`, `deleted_at`, `created_id`, `updated_id`, `deleted_id`, `meta_json`

## Dockerサービス構成

```
frontend (8080)  →  api (3000)  →  db (5432, PostgreSQL 16)
                     ↓
                    s3 (9000, VersityGW)
                    local_ses (8005)
```

- api: `bacon fmt-run --headless` で自動再ビルド
- db: 全SQL文をログ出力
- s3: POSIXバックエンドのS3互換ストレージ

## 設計原則

1. **コード生成が正**: 自動生成ファイルを直接編集しない。定義ファイルを変更して再生成する
2. **レイヤー依存は一方向**: kernel → adapter → api。逆方向の依存は禁止
3. **型安全性**: ID型のNewTypeパターン、`garde`バリデーション、TypeScript strict mode
4. **区分値で統一**: booleanフラグも区分値として管理し、将来の拡張性を確保
5. **EntryPoint/Page分離**: ルーティング層（自動生成）と実装層（手動）を分離
6. **イベント駆動リポジトリ**: CRUD操作はイベントオブジェクト（CreateUser, UpdateUser等）で表現
7. **サービス層統一**: すべてのハンドラー・エクストラクターはサービス経由でデータ操作を行う。各エンティティに対応するサービスをkernelのservice層に実装し、リポジトリはサービスの内部実装詳細とする。registryの`AppRegistryExt`にはサービスのみ公開する

## 新機能追加時の実装順序

1. エンティティID（`entity_ids/index.ts`）
2. 区分値（`kbns/index.ts`）— 必要な場合
3. テーブル定義（`tables/definitions/`）— 必要な場合
4. APIスキーマ（`api_schemas/definitions/`）
5. APIエンドポイント（`api_endpoints/definitions/`）
6. ページ定義（`pages/definitions/`）— 必要な場合
7. `sampleapp local generate` 実行
8. バックエンド実装（kernel model → kernel repository → kernel service → adapter → registry → api handler）
9. フロントエンド実装（ページコンポーネント）
10. `sampleapp local lint all` で品質チェック
