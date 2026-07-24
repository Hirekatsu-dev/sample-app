# スコープ05: プロダクトとバージョンの管理

## 目的

テストケースの所属先となるプロダクトと、そのバージョンを管理できるようにする。テストケースはバージョンごとに保持するため、バージョンが以降のスコープの基点になる。

## 対象要件

- ユーザーは利用中のワークスペースにプロダクトを追加することができる
- ユーザーは利用中のワークスペースに設定されているプロダクトの一覧を表示できる
- ユーザーは利用中のワークスペースからプロダクトを削除できる
- ユーザーはプロダクトのバージョンを管理できる

## 前提スコープ

- 04 ワークスペースの選択・切替・招待

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| entity_ids | `ProductId`, `ProductVersionId` |
| entities | `product`（`id` / `workspace_id` / `name` / `description`）、`product_version`（`id` / `product_id` / `name` / `description` / `released_at`） |
| tables | `products`（`workspace_id` × `name` にユニークインデックス）、`product_versions`（`product_id` × `name` にユニークインデックス） |
| api_schemas | `ProductSummary`, `ProductDetail`, `CreateProductRequest`, `UpdateProductRequest`, `ProductVersionSummary`, `CreateProductVersionRequest`, `UpdateProductVersionRequest` |
| api_endpoints | `GET/POST /v1/products`、`GET/PUT/DELETE /v1/products/{product_id}`、`GET/POST /v1/products/{product_id}/versions`、`GET/PUT/DELETE /v1/products/{product_id}/versions/{version_id}` |
| errors | プロダクト名の重複、バージョン名の重複、最大プロダクト数の超過 |
| pages | `ProductList`、`ProductDetail`（バージョン一覧を含む） |

### API

- `repository/product.rs`, `repository/product_version.rs` を追加する
- `service/product.rs`
  - 作成時にワークスペースの `max_product_count` を超えないことを検証する
  - 取得・更新・削除の各操作で、対象が利用中のワークスペースに属することを検証する
  - 削除は論理削除（`public` → `garbage`）とし、配下のバージョンもあわせて移動する
- `service/product_version.rs`
  - バージョンの作成・更新・削除
  - 削除時、配下にテストスイート・テストケースが存在する場合の扱いはスコープ06以降で追加する

### フロントエンド

- プロダクト一覧（カード or テーブル）と作成・編集・削除
- プロダクト詳細内のバージョン一覧と作成・編集・削除
- Storybookストーリーを作成する

## テスト

- プロダクトの作成・更新・削除
- 最大プロダクト数に達した状態での作成がエラーになること
- 他のワークスペースのプロダクトを取得・更新・削除できないこと
- 同一ワークスペース内でのプロダクト名重複、同一プロダクト内でのバージョン名重複

## 完了条件

- ワークスペースごとにプロダクトとバージョンを管理できる
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **バージョンの表現**: バージョンは文字列の名前（例: `1.0.0`）で管理し、順序はリリース日（`released_at`）と作成日時で決める。セマンティックバージョニングとしての解釈やソートは行わない。
- **削除の連鎖**: プロダクト削除時に配下のバージョンも論理削除する。テストケースやテスト実行が存在する場合に削除を禁止するかは、スコープ10で実行データが入った時点で再検討する。
