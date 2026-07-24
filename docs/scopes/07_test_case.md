# スコープ07: テストケースとテスト手順の管理

## 目的

テストスイート配下でテストケースを作成・編集・整理できるようにする。複数のテスト手順（操作内容と期待結果）を持たせる。

## 対象要件

- ユーザーはテストスイートにテストケースを追加できる（タイトル / 概要 / 前提条件 / 優先度 / 種別 / 想定所要時間 / 表示順、複数のテスト手順）
- ユーザーはテストケースの内容を変更できる
- ユーザーはテストケースを別のテストスイートへ移動できる
- ユーザーはテストケースを複製できる
- ユーザーはテストケースを削除できる
- ユーザーはテストスイート・テストケースを一覧で表示できる（タイトル・優先度・種別・ステータスで絞り込み）

## 前提スコープ

- 06 テストスイート管理

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| kbns | `test_case_priority`（`high`: 高 / `middle`: 中 / `low`: 低）、`test_case_type`（`functional`: 機能 / `non_functional`: 非機能 / `regression`: 回帰）、`test_case_status`（`draft`: 下書き / `reviewing`: レビュー依頼中 / `approved`: 承認済み / `rejected`: 差し戻し） |
| entity_ids | `TestCaseId`, `TestCaseStepId` |
| entities | `test_case`（`id` / `test_suite_id` / `title` / `description`（概要） / `precondition_content` / `priority_kbn` / `type_kbn` / `status_kbn` / `estimated_count`（想定所要時間・分） / `display_count`）、`test_case_step`（`id` / `test_case_id` / `display_count`（手順番号） / `operation_content` / `expected_content`） |
| tables | `test_cases`（`test_suite_id` にインデックス）、`test_case_steps`（`test_case_id` にインデックス） |
| api_schemas | `TestCaseSummary`, `TestCaseDetail`, `TestCaseStep`, `CreateTestCaseRequest`, `UpdateTestCaseRequest`, `MoveTestCaseRequest` |
| api_endpoints | `GET /v1/product_versions/{version_id}/test_cases`（絞り込み付き一覧）、`GET /v1/test_suites/{test_suite_id}/test_cases`、`POST /v1/test_suites/{test_suite_id}/test_cases`、`GET/PUT/DELETE /v1/test_cases/{test_case_id}`、`PUT /v1/test_cases/{test_case_id}/test_suite`（移動）、`POST /v1/test_cases/{test_case_id}/duplicate`（複製） |
| errors | 手順が0件、手順番号の重複、移動先スイートがバージョン外 |
| pages | `TestCaseList`（左ペインにスイートツリー、右ペインにケース一覧）、`TestCaseDetail`、`TestCaseEdit` |

### API

- `repository/test_case.rs`, `repository/test_case_step.rs` を追加する
- `service/test_case.rs`
  - 作成・更新時に手順を一括で受け取り、既存手順との差分ではなく置き換えで保存する
  - 手順は1件以上必須とし、手順番号は保存時に1から連番へ振り直す
  - `status_kbn` は作成時に「下書き」で固定する（状態遷移はスコープ08で実装する）
  - 移動時、移動先スイートが同一バージョン配下であることを検証する
  - 複製はタイトルに接尾辞を付け、手順を含めて複製する。複製結果は「下書き」とする
  - 一覧はタイトルの部分一致、優先度、種別、ステータスで絞り込み、ページングに対応する

### フロントエンド

- スイートツリーとケース一覧の2ペイン構成（スコープ06のツリーを再利用する）
- ケース編集フォーム（手順の追加・削除・並べ替え）
- 絞り込みUI（タイトル検索、優先度・種別・ステータスの複数選択）
- Storybookストーリーを作成する

## テスト

- テストケースの作成・更新・削除（手順の置き換えを含む）
- 手順0件での作成・更新がエラーになること
- 移動（同一バージョン内 / 別バージョンへの移動がエラーになること）
- 複製結果の内容と手順が一致し、ステータスが下書きになること
- 一覧の絞り込みとページング

## 完了条件

- テストケースを作成・編集・移動・複製・削除でき、条件を指定して一覧できる
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **想定所要時間の単位**: 分単位の整数（`estimated_count`）とする。時間単位の入力が必要ならフロントエンドで変換する。
- **手順の保存方式**: 差分更新ではなく全置き換えとする。手順IDの安定性は要件上不要で、実装と検証が単純になるため。テスト実行側はスナップショットを持つ（スコープ10）ため、置き換えによる影響はない。
- **優先度・種別の値**: 要件の例に沿って上記の値とする。ワークスペースごとにカスタマイズする仕組みは作らない（区分値として固定する）。
