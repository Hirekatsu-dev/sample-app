# スコープ06: テストスイート管理

## 目的

プロダクトのバージョン配下に、入れ子可能なテストスイートの階層を作れるようにする。テストケースの整理軸をここで確定させる。

## 対象要件

- ユーザーはプロダクトのバージョン配下にテストスイートを作成できる（名前 / 説明 / 表示順、入れ子可能）
- ユーザーはテストスイートの名前・説明・表示順を変更できる
- ユーザーはテストスイートを別のテストスイート配下へ移動できる
- ユーザーはテストスイートを削除できる（配下に要素がある場合は削除できない）

## 前提スコープ

- 05 プロダクトとバージョンの管理

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| entity_ids | `TestSuiteId` |
| entities | `test_suite`（`id` / `product_version_id` / `parent_test_suite_id`（NULL許可） / `name` / `description` / `display_count`） |
| tables | `test_suites`（`product_version_id` と `parent_test_suite_id` にインデックス）。同一階層での名前の重複を防ぐため、`(product_version_id, parent_test_suite_id, name)` にDBレベルの一意制約を設ける。`parent_test_suite_id` が NULL のルート直下でも兄弟名が一意になるよう、NULL を素通りさせない方式（`COALESCE(parent_test_suite_id, '00000000-...')` を用いた一意インデックス、または NULL・非NULL 用の2本の部分一意インデックス）で実装する |
| api_schemas | `TestSuiteNode`（子を持つツリー構造）、`TestSuiteDetail`、`CreateTestSuiteRequest`、`UpdateTestSuiteRequest`、`MoveTestSuiteRequest` |
| api_endpoints | `GET /v1/product_versions/{version_id}/test_suites`（ツリー取得）、`POST /v1/product_versions/{version_id}/test_suites`、`GET/PUT/DELETE /v1/test_suites/{test_suite_id}`、`PUT /v1/test_suites/{test_suite_id}/parent`（移動） |
| errors | 配下に要素があるため削除できない、循環する移動先の指定、階層の深さ上限の超過、同一階層での名前の重複 |
| pages | `TestSuiteList`（バージョン配下のツリー表示） |

### API

- `repository/test_suite.rs`
  - 再帰CTEでバージョン配下のスイートを一括取得し、サービス層でツリーへ組み立てる
- `service/test_suite.rs`
  - 作成・更新（名前・説明・表示順）
  - 移動時の検証
    - 移動先が同一バージョン配下であること
    - 移動先が自分自身、または自分の子孫でないこと（循環の防止）
    - 移動後の階層の深さが上限を超えないこと
  - 削除時に配下のテストスイートおよびテストケースが存在しないことを検証する
  - `display_count` は同一階層内での表示順とし、指定がない場合は末尾に採番する

### フロントエンド

- ツリー表示（開閉、選択、キーボード操作に対応する）
- スイートの作成・編集・削除のダイアログ
- 移動UI（親スイートの選択。ドラッグ＆ドロップは対象外とする）
- Storybookストーリーを作成する

## テスト

- ツリーの取得（階層構造と表示順が正しいこと）
- 作成・更新・移動・削除
- 自分自身または子孫への移動がエラーになること
- 配下に要素がある状態での削除がエラーになること
- 別バージョン・別ワークスペースのスイートを操作できないこと

## 完了条件

- バージョン配下でテストスイートの階層を作成・編集・移動・削除できる
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **階層の深さ**: 無制限にすると表示と再帰処理が扱いにくいため、上限（例: 5階層）を設けてエラーコードで返す。上限値は実装時に確定する。
- **表示順の持ち方**: 同一階層内の整数（`display_count`）で管理する。並べ替え時に同一階層をまとめて更新する方式とし、小数や連結リストは使わない。
- **ルート直下のケース**: テストケースは必ずいずれかのスイートに属する前提とする（バージョン直下にケースを置くことは許可しない）。
