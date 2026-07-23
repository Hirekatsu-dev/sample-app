---
name: sampleapp-cli
description: sampleapp CLIコマンドのリファレンス。Docker操作、コード生成、リンティング、テスト実行などの開発作業で使用する。sampleappコマンドの使い方を確認する必要があるときに参照する。
user-invocable: false
---

# sampleapp CLIリファレンス

このプロジェクトでは `sampleapp` CLIコマンドを使って開発作業を行う。直接 `docker-compose` や `cargo` を実行せず、必ず `sampleapp` コマンド経由で実行すること。

## コマンド一覧

### 開発環境の操作

| コマンド | 説明 | 使うタイミング |
|----------|------|----------------|
| `sampleapp local start` | Dockerコンテナを起動 | 開発開始時 |
| `sampleapp local stop` | Dockerコンテナを停止 | 開発終了時 |
| `sampleapp local restart` | Dockerコンテナを再起動 | 設定変更後 |
| `sampleapp local build` | Dockerイメージをビルド | Dockerfile変更後 |
| `sampleapp local ps` | コンテナの状態を表示 | 状態確認時 |
| `sampleapp local logs` | コンテナのログを表示 | デバッグ時 |
| `sampleapp local browse` | ブラウザで開発環境を開く | 動作確認時 |

### コンテナ内操作

| コマンド | 説明 | 使うタイミング |
|----------|------|----------------|
| `sampleapp local exec <service> <command>` | コンテナ内でコマンド実行 | 任意のコマンド実行時 |
| `sampleapp local shell <service>` | コンテナ内のシェルを起動 | 対話操作が必要な時 |
| `sampleapp local pg` | PostgreSQLコンテナに接続 | SQL直接実行時 |

### コード品質

| コマンド | 説明 | 使うタイミング |
|----------|------|----------------|
| `sampleapp local lint all` | フロントエンド＋APIの一括リンティング | 実装完了後の品質チェック |
| `sampleapp local lint frontend` | フロントエンドのみリンティング | フロントエンド変更後 |
| `sampleapp local lint api` | APIのみリンティング | API変更後 |

### コード生成

| コマンド | 説明 | 使うタイミング |
|----------|------|----------------|
| `sampleapp local generate` | ソースコードの自動生成を実行 | seed定義変更後（後述） |

### テスト

| コマンド | 説明 | 使うタイミング |
|----------|------|----------------|
| `sampleapp local test prepare` | テストDBを初期化 | テスト実行前（DB構造変更後） |
| `sampleapp local test api` | APIの自動テストを実行 | API変更後 |

### 環境初期化

| コマンド | 説明 | 使うタイミング |
|----------|------|----------------|
| `sampleapp local prepare` | 開発環境を全初期化（DB + S3 + SES） | 環境を初期状態に戻す時 |

### 本番環境

| コマンド | 説明 |
|----------|------|
| `sampleapp prod build` | デプロイ用ビルド |
| `sampleapp prod deploy` | 本番デプロイ |

※ `sampleapp prod` 系コマンドは `settings.json` の `deny` ルールでブロックされている。

## コード自動生成のトリガー

以下のseedファイルを変更した場合、`sampleapp local generate` の実行が必要:

| 変更対象 | 場所 | 生成されるもの |
|----------|------|----------------|
| APIスキーマ | `generator/src/seed/api_schemas/` | フロントエンド/バックエンドの型、OpenAPIスキーマ |
| APIエンドポイント | `generator/src/seed/api_endpoints/` | ルート定義、ハンドラースタブ、APIクライアント |
| テーブル定義 | `generator/src/seed/tables/` | DDL、テスト用SQL、ER図 |
| 区分値 | `generator/src/seed/kbns/` | フロントエンド/バックエンドの区分値Enum |
| エラーコード | `generator/src/seed/errors/` | フロントエンド/バックエンドのエラーコード |
| エンティティID | `generator/src/seed/entity_ids/` | RustのNewType ID定義 |
| ページ定義 | `generator/src/seed/pages/` | ルート定義、EntryPointコンポーネント、画面遷移図 |

## 重要な制約

1. **自動生成ファイルは直接編集しない**: ファイル先頭に自動生成コメントがあるファイルはseedを変更して再生成する
2. **フロントエンドのnpmコマンドはDocker内で実行**: `sampleapp local exec frontend <command>` を使用する
3. **adapter層のDBテストは `--test-threads=1` が必要**: 共有テストDBを使うため並列実行不可
4. **`sampleapp local prepare` はDB全初期化**: 既存データが全て消えるため、必要な場合のみ実行する
