# スコープ10: テスト実行の作成と管理

## 目的

テスト実行（テストラン）の概念を導入し、対象バージョンと対象テストケースを決めて実行の器を作れるようにする。作成時点のテストケース内容をスナップショットとして取り込む。

## 対象要件

- ユーザーはテスト実行を作成できる（名前 / 対象バージョン / 説明 / 予定開始日 / 予定終了日、対象ケースをスイート単位またはケース単位で選択）
- 選択できるのは対象バージョンの承認済みテストケースのみとする
- 作成時点のテストケースの内容をテスト実行側に取り込む
- テスト実行は「未着手 / 実行中 / 完了 / 中止」のステータスを持つ
- ユーザーはテスト実行を開始・完了・中止できる
- ユーザーはテスト実行に含まれるテストケースへ担当者を割り当てできる（まとめて割り当て可能）
- ユーザーはテスト実行を削除できる

## 前提スコープ

- 08 テストケースのレビュー・承認フロー

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| kbns | `test_run_status`（`not_started`: 未着手 / `running`: 実行中 / `completed`: 完了 / `canceled`: 中止） |
| entity_ids | `TestRunId`, `TestRunCaseId`, `TestRunCaseStepId` |
| entities | `test_run`（`id` / `workspace_id` / `product_version_id` / `name` / `description` / `status_kbn` / `planned_start_at` / `planned_end_at` / `started_at` / `ended_at`）、`test_run_case`（`id` / `test_run_id` / `test_case_id`（参照元） / `test_suite_path_content` / `title` / `description` / `precondition_content` / `priority_kbn` / `type_kbn` / `estimated_count` / `display_count` / `assigned_user_id`）、`test_run_case_step`（`id` / `test_run_case_id` / `display_count` / `operation_content` / `expected_content`） |
| tables | `test_runs`、`test_run_cases`（`test_run_id` にインデックス）、`test_run_case_steps` |
| api_schemas | `TestRunSummary`, `TestRunDetail`, `CreateTestRunRequest`, `UpdateTestRunRequest`, `TestRunCaseSummary`, `AssignTestRunCasesRequest`（複数ケースIDと担当者） |
| api_endpoints | `GET/POST /v1/test_runs`、`GET/PUT/DELETE /v1/test_runs/{test_run_id}`、`PUT /v1/test_runs/{test_run_id}/status`、`GET /v1/test_runs/{test_run_id}/cases`、`PUT /v1/test_runs/{test_run_id}/cases/assignees` |
| errors | 対象テストケースが未選択、承認済みでないケースの指定、不正なステータス遷移、完了・中止済みの実行の変更、担当者が同一ワークスペースに所属していない |
| pages | `TestRunList`、`TestRunCreate`、`TestRunDetail` |

### API

- `repository/test_run.rs`, `repository/test_run_case.rs` を追加する
- `service/test_run.rs`
  - 作成時、指定されたスイート配下および個別指定のテストケースを解決し、承認済みのもののみを対象にする
  - 対象ケースの内容と手順を `test_run_cases` / `test_run_case_steps` へ複製する（スナップショット）
  - スイートの階層は `test_suite_path_content` に文字列（例: `認証 / ログイン`）で保持し、実行側からスイートを参照しない
  - 対象が0件の場合はエラーにする
  - 状態遷移

    | 現在 | 操作 | 遷移後 |
    | --- | --- | --- |
    | 未着手 | 開始 | 実行中 |
    | 実行中 | 完了 | 完了 |
    | 未着手 / 実行中 | 中止 | 中止 |

  - 開始時に `started_at`、完了・中止時に `ended_at` を記録する
  - 完了・中止後は対象ケースの変更・担当者割当を受け付けない
  - 担当者の一括割当は、指定された `test_run_case` がすべて同一の実行に属することを検証する
  - 削除は開発方針の論理削除方式（対象行を `public` から `garbage` スキーマへ移動）で表現し、`test_run` 本体とあわせて配下の `test_run_case` / `test_run_case_step` も同一トランザクションで `garbage` へ移動する。`public` には生存行しか残らないため、一覧・検索・集計は通常のクエリ（`public` 参照）で自動的に削除済みを除外する（`deleted_at IS NULL` のような絞り込みは書かない）

### フロントエンド

- テスト実行一覧（ステータス・バージョンでの絞り込み）
- 作成画面（バージョン選択 → スイートツリーからのチェックボックス選択 → 対象件数の確認）
- 詳細画面（概要、ステータス操作、対象ケース一覧、担当者の一括割当）
- Storybookストーリーを作成する

## テスト

- 作成時に承認済みケースのみが取り込まれること
- 対象0件での作成がエラーになること
- 作成後に元のテストケースを変更しても実行側の内容が変わらないこと
- 状態遷移の正常系と不正な遷移
- 完了後に担当者割当ができないこと
- 担当者の一括割当（他の実行のケースIDを混ぜた場合にエラーになること）

## 完了条件

- テスト実行を作成し、ステータスを操作でき、担当者を割り当てられる
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **スナップショット方式**: 実行中に元ケースが編集されても結果の意味が変わらないよう、作成時点の内容を複製する。`test_case_id` は分析（繰り返し不合格の集計、スコープ14）で使うため参照として保持するが、表示には使わない。
- **対象ケースの後追い追加**: 作成後に対象ケースを追加・削除する機能は要件にないため実装しない。必要であれば新しいテスト実行を作成する運用とする。
