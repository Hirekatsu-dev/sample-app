# sample-app

Vue 3 + Rust(axum) + PostgreSQL のサンプル Web アプリケーション。

## このリポジトリについて

**コードレビュー支援サービスやコード品質チェックサービスの試運転を目的とした、public リポジトリ用のサンプルです。**

そのため、以下の方針で運用しています。

- 初期コミットには**配管（Docker、CI、コード生成の仕組み、エラー処理などの土台）だけ**を含める。
- 機能はすべて Pull Request として追加する。レビュー対象の差分を増やすため。
- 1 PR = 1 つの論理的な変更にする。

作るものの要件は [要件.md](要件.md)、実装単位への分割は [docs/scopes](docs/scopes/README.md) を参照してください。

## 主要技術

| 領域 | 技術 |
| --- | --- |
| フロントエンド | Vue 3 / TypeScript / Vite / Tailwind CSS / Storybook / Biome |
| API | Rust / axum / sqlx |
| DB | PostgreSQL |
| コード生成 | TypeScript（`generator/`） |
| 実行環境 | Docker Compose |

システム構成はフロントエンド、API サーバー（以降単に API と表現します）、DB です。

## 環境構築

### 前提条件

- docker が開発者のマシンにインストールされている前提
- docker compose コマンド v2 が開発者のマシンにインストールされている前提

`apps/api/example.env` をコピーして、同じディレクトリに `.env` ファイルを作ってください。

### sampleapp コマンドのインストール（任意）

`cli/bin/sampleapp` のパスを通すと、開発作業を `sampleapp local <command>` で実行できます。

```sh
# 例: ~/.bashrc に追記
export PATH="$PATH:/path/to/cli/bin"
```

以降の手順は素の `docker compose` でも実行できます。

### 初期化

```sh
# カレントディレクトリがルートディレクトリである前提
# docker image のビルド（初回・変更時のみ）
docker compose build
# docker コンテナの起動
docker compose up -d
# データベースの初期化（初回・変更時のみ）
docker compose exec db sh -c "cd bin && bash ./prepare.sh"
```

## ローカル環境で動かす

コンテナが起動している状態で `http://localhost:8080` にアクセスします。

ヘルスチェックの結果が表示されれば、フロントエンド → API → DB の疎通が取れています。

## 開発をする

### 自動生成

区分値・エラーコード・テーブル・APIスキーマ・エンドポイント・画面などを、`generator/src/seed/` に TypeScript で定義し、そこから各種コードを生成します。

自動生成されるファイルには「このファイルは …… から生成されます。直接編集しないでください。」というコメントが入ります。これらは直に変更せず、`generator/src/seed/` の定義を変更してください。

生成されるもの:

- SQL: テーブル定義、外部キー制約
- Rust: エンティティID、区分値、エラーコード、APIスキーマ型、ルーティング、ハンドラのディスパッチ
- TypeScript: APIクライアント、型定義、区分値、エラーコード
- Vue: ページの EntryPoint、ルーター定義
- Markdown / OpenAPI: ER図、テーブル詳細、画面遷移図、APIスキーマ

自動生成は以下のコマンドで実行できます。

```sh
sampleapp local generate
```

### フロントエンド

#### storybook

コンポーネント単位で動作確認をします。

```sh
docker compose exec frontend npm run storybook
```

`http://localhost:6006` にアクセスすると、story を確認できます。

### API サーバー ・ DB

API サーバーは DB との依存が強いので、ここで合わせて扱います。

設計方針は [`apps/api/README.md`](apps/api/README.md) を参照してください。

#### テスト実行

自動テストを実行します。失敗するテストがあったら直しましょう。

```sh
docker compose exec api cargo test -- --test-threads=1
```

#### DB 初期化

```sh
docker compose exec db sh -c "cd bin && bash ./prepare.sh"
```
