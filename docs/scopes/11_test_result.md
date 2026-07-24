# スコープ11: 実行結果の記録と進捗表示

## 目的

テスト実行に含まれるテストケースの結果を記録し、実行の進捗を確認できるようにする。再実施の履歴を残す。

## 対象要件

- ユーザーはテスト実行に含まれるテストケースの実行結果を記録できる（未実施 / 合格 / 不合格 / ブロック / スキップ）
- 実行結果には実施者・実施日時・所要時間・備考を記録できる
- テスト手順ごとに合否を記録できる
- ユーザーは実行結果の記録履歴を確認できる（再実施した場合、過去の結果も参照できる）
- ユーザーはテスト実行の進捗を一覧で確認できる（担当者・実行結果・テストスイートで絞り込み）

## 前提スコープ

- 10 テスト実行の作成と管理

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| kbns | `test_result`（`not_executed`: 未実施 / `passed`: 合格 / `failed`: 不合格 / `blocked`: ブロック / `skipped`: スキップ）、`test_step_result`（`not_executed`: 未実施 / `passed`: 合格 / `failed`: 不合格） |
| entity_ids | `TestResultId`, `TestResultStepId` |
| entities | `test_result`（`id` / `test_run_case_id` / `result_kbn` / `executed_user_id` / `executed_at` / `duration_count`（所要時間・分） / `note_content`）、`test_result_step`（`id` / `test_result_id` / `test_run_case_step_id` / `result_kbn`） |
| tables | `test_results`（`test_run_case_id` にインデックス）、`test_result_steps`。`test_run_cases` に `latest_result_kbn`（初期値: 未実施）と `latest_test_result_id`（NULL許可）を追加する |
| api_schemas | `RecordTestResultRequest`（結果・所要時間・備考・手順ごとの結果）、`TestResultDetail`、`TestResultHistory`、`TestRunProgressSummary` |
| api_endpoints | `POST /v1/test_run_cases/{test_run_case_id}/results`、`GET /v1/test_run_cases/{test_run_case_id}/results`（履歴）、`GET /v1/test_runs/{test_run_id}/cases`（絞り込みを拡張）、`GET /v1/test_runs/{test_run_id}/progress` |
| errors | 実行中でないテスト実行への結果記録、手順の結果が対象ケースの手順と一致しない、所要時間が負の値 |
| pages | `TestRunExecution`（実行画面） |

### API

- `repository/test_result.rs` を追加する
- `service/test_result.rs`
  - 結果は記録のたびに新しい `test_results` を追加する（更新ではなく追記）
  - 記録と同時に `test_run_cases.latest_result_kbn` と `latest_test_result_id` を更新する
  - 対象のテスト実行が「実行中」であることを検証する
  - 手順ごとの結果は、対象ケースの手順すべてに対して受け取る
  - 実施者はログイン中のユーザー、実施日時はサーバー側で採番する（クライアント指定は受け付けない）
- 進捗取得は、実行に含まれるケースを結果区分ごとに集計して返す
- ケース一覧の絞り込みに、担当者・最新結果・スイートパスを追加する

### フロントエンド

- 実行画面: 左に対象ケース一覧（絞り込み・結果バッジ）、右に選択ケースの手順と結果入力フォーム
- 手順ごとの合否を入力すると全体の結果の初期値を提案する（不合格が1件でもあれば不合格）
- 履歴の表示（実施者・日時・結果・備考）
- 進捗の可視化（結果区分ごとの件数と割合のバー）
- キーボード操作で次のケースへ移動できるようにする
- Storybookストーリーを作成する

## テスト

- 結果の記録（合格 / 不合格 / ブロック / スキップ）と最新結果の更新
- 再実施時に履歴が増え、最新結果が最後の記録になること
- 実行中でないテスト実行への記録がエラーになること
- 手順の結果の件数・対象が一致しない場合にエラーになること
- 一覧の絞り込み（担当者 / 結果 / スイート）と進捗集計の件数

## 完了条件

- テスト実行の画面から結果を記録でき、履歴と進捗が確認できる
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **最新結果の非正規化**: 進捗一覧と絞り込みのたびに履歴の最新行を求めるのは負荷が高いため、`test_run_cases` に最新結果を保持する。整合性は結果記録のトランザクション内で担保する。
- **結果の取り消し**: 記録済みの結果の削除・修正は行わず、再度記録して履歴を積む方式とする（監査性を優先する）。
- **手順ごとの結果の必須性**: 手順ごとの結果は必須とする。スキップ・ブロックの場合は「未実施」を許容する。
