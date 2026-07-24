# スコープ13: 不具合管理

## 目的

不合格・ブロックとなった実行結果から不具合を起票し、修正状況を追跡できるようにする。

## 対象要件

- ユーザーは不合格またはブロックとなった実行結果から不具合を起票できる（タイトル / 内容 / 重要度 / 担当者、起票元の実行結果と紐づける）
- 不具合は「未対応 / 対応中 / 修正済み / 再テスト待ち / 完了 / 対応しない」のステータスを持つ
- ユーザーは不具合のステータス・担当者・内容を更新できる
- ユーザーは不具合にコメントを追加できる
- ユーザーは既存の不具合を実行結果に紐づけできる
- ユーザーは利用中のワークスペースの不具合を一覧で表示できる（プロダクト・バージョン・ステータス・重要度・担当者で絞り込み）

## 前提スコープ

- 11 実行結果の記録と進捗表示

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| kbns | `defect_status`（`open`: 未対応 / `in_progress`: 対応中 / `fixed`: 修正済み / `retesting`: 再テスト待ち / `closed`: 完了 / `wont_fix`: 対応しない）、`defect_severity`（`critical`: 致命的 / `major`: 重大 / `middle`: 中 / `minor`: 軽微） |
| entity_ids | `DefectId`, `DefectTestResultId`, `DefectCommentId` |
| entities | `defect`（`id` / `workspace_id` / `product_id` / `title` / `content` / `status_kbn` / `severity_kbn` / `assigned_user_id` / `reported_user_id` / `reported_at` / `closed_at`）、`defect_test_result`（`id` / `defect_id` / `test_result_id`）、`defect_comment`（`id` / `defect_id` / `posted_user_id` / `content` / `posted_at`） |
| tables | `defects`、`defect_test_results`（`defect_id` × `test_result_id` にユニークインデックス）、`defect_comments` |
| api_schemas | `DefectSummary`, `DefectDetail`, `CreateDefectRequest`, `UpdateDefectRequest`, `LinkDefectRequest`, `DefectComment` |
| api_endpoints | `GET/POST /v1/defects`、`GET/PUT/DELETE /v1/defects/{defect_id}`、`PUT /v1/defects/{defect_id}/status`、`GET/POST /v1/defects/{defect_id}/comments`、`POST /v1/test_results/{test_result_id}/defects`（起票）、`POST /v1/test_results/{test_result_id}/defects/{defect_id}`（既存の紐づけ）、`DELETE /v1/test_results/{test_result_id}/defects/{defect_id}` |
| errors | 起票元の結果が不合格・ブロックではない、既に紐づけ済み、不正なステータス遷移、別ワークスペースの不具合との紐づけ |
| pages | `DefectList`、`DefectDetail` |

### API

- `repository/defect.rs`, `repository/defect_comment.rs` を追加する
- `service/defect.rs`
  - 起票時、対象の実行結果が不合格またはブロックであることを検証する
  - 起票時に、実行結果からプロダクトを解決して `product_id` を保持する（一覧の絞り込みで使用）
  - 状態遷移

    | 現在 | 遷移可能な状態 |
    | --- | --- |
    | 未対応 | 対応中 / 対応しない |
    | 対応中 | 修正済み / 未対応 / 対応しない |
    | 修正済み | 再テスト待ち / 対応中 |
    | 再テスト待ち | 完了 / 対応中 |
    | 完了 | 未対応（再発時） |
    | 対応しない | 未対応 |

  - 「完了」「対応しない」への遷移時に `closed_at` を記録し、そこから戻す場合はクリアする
  - 既存不具合の紐づけは、同一ワークスペースの不具合のみ許可する
  - 一覧はプロダクト・バージョン・ステータス・重要度・担当者で絞り込み、ページングに対応する
    - バージョンでの絞り込みは、紐づく実行結果が属するテスト実行の対象バージョンで判定する

### フロントエンド

- 実行結果の画面から不具合を起票するダイアログと、既存不具合を検索して紐づけるUI
- 不具合一覧（絞り込み、重要度・ステータスのバッジ）
- 不具合詳細（内容の編集、ステータス操作、担当者変更、コメント、紐づく実行結果の一覧）
- Storybookストーリーを作成する

## テスト

- 起票（不合格 / ブロック）と、合格・スキップからの起票がエラーになること
- ステータス遷移の正常系と不正な遷移、`closed_at` の記録
- 既存不具合の紐づけ・重複紐づけ・別ワークスペースの不具合の紐づけ
- コメントの投稿
- 一覧の絞り込み（プロダクト / バージョン / ステータス / 重要度 / 担当者）

## 完了条件

- 実行結果から不具合を起票し、ステータスを追跡でき、ワークスペース横断で一覧できる
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **不具合の所属単位**: ワークスペース直下に置き、プロダクトを属性として持たせる。バージョンを直接持たせず紐づく実行結果から辿る形にしているのは、同じ不具合が複数バージョンの結果に紐づくことを許容するため。
- **再テストの自動化**: 「再テスト待ち」から実行結果の記録によって自動で「完了」にする連携は行わない。ステータスは手動で更新する。
