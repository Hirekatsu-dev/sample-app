# admin_frontend

管理画面のフロントエンド。

メンバー向けの `apps/frontend` とは別アプリケーションとして動作し、ポートは **8081** を使う。
API は管理API（`apps/admin_api`、ポート3001）を呼ぶ。

## 構成

- `src/pages/generated/*EntryPoint.vue` — 自動生成。ルーティングコンテキストを提供する
- `src/pages/inner/*Page.vue` — 手動実装。EntryPoint から context を props で受け取る

## デザイン

メンバー画面（`apps/frontend`）とは別のデザイントークンを使う。操作している画面がどちらなのかを一目で判別できるようにするためで、見た目の差は意図的なもの。

| | メンバー画面 | 管理画面 |
| --- | --- | --- |
| 系統 | 紙とインク（温色） | 青焼き図面（寒色） |
| 地色 | `#fafaf8` | `#eef2f8` |
| インク | `#111827` | `#15233c` |
| アクセント | 朱色 `#ea580c` | ブループリントブルー `#1a5fd0` |
| 書体 | Lora（セリフ） | IBM Plex Sans / IBM Plex Mono |
| 背景 | ドットグリッド | 方眼（`bg-blueprint-grid`） |

トークンは `src/tailwind.css` の `@theme` に定義している。**キー名はメンバー画面と揃えている**ため、`apps/frontend` からUIコンポーネントを移植する際はクラス名を変えずに配色だけが差し替わる。

数値や状態は等幅（`font-mono`）で表示し、装飾は方眼だけに絞る。

## 自動生成されるファイル

以下は `generator/src/seed` の定義から `sampleapp local generate` で生成される。直接編集しない。

- `src/api/generated_api.ts` — APIクライアント
- `src/api/schemas/generated_schemas.ts` — APIスキーマ
- `src/error_code.ts` — 管理API固有のエラーコード
- `src/kbn.ts` — 区分値（メンバー画面と共通）
- `src/pages/generated/` — EntryPoint
- `src/router/generated/routes.ts` — ルート定義

## 起動

```sh
sampleapp local start
```

http://localhost:8081 で管理画面が開く。

## コマンド

npm コマンドは Docker コンテナ内で実行する。

```sh
sampleapp local exec admin_frontend npm run lint
sampleapp local exec admin_frontend npm run type-check
```
