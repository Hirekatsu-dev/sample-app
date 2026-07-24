# 実装スコープ一覧

`要件.md` の機能を実装単位に分割したドキュメントです。1スコープ = 1つのPRを想定しています。

各スコープのドキュメントには、対象要件・前提スコープ・実施内容（seed定義／サービス層／フロントエンド）・テスト観点・完了条件・判断が必要な点を記載しています。

## 実装済み

| # | スコープ | 内容 |
| --- | --- | --- |
| - | 配管 | Docker、CI、コード生成、エラー処理の土台（ヘルスチェックのみ動作） |
| - | メンバー認証 | メンバー画面のログイン・ログアウト・ログイン中ユーザー取得 |

## 未実装

| # | スコープ | ドキュメント | 前提 |
| --- | --- | --- | --- |
| 01 | 管理者認証と管理画面の基盤 | [01_admin_auth.md](01_admin_auth.md) | - |
| 02 | ワークスペース管理（管理画面） | [02_workspace_management.md](02_workspace_management.md) | 01 |
| 03 | アカウント設定とパスワード再発行 | [03_account_settings.md](03_account_settings.md) | 01 |
| 04 | ワークスペースの選択・切替・招待 | [04_workspace_membership.md](04_workspace_membership.md) | 02, 03 |
| 05 | プロダクトとバージョンの管理 | [05_product_version.md](05_product_version.md) | 04 |
| 06 | テストスイート管理 | [06_test_suite.md](06_test_suite.md) | 05 |
| 07 | テストケースとテスト手順の管理 | [07_test_case.md](07_test_case.md) | 06 |
| 08 | テストケースのレビュー・承認フロー | [08_test_case_review.md](08_test_case_review.md) | 07 |
| 09 | テストケースのコピーとCSV入出力 | [09_test_case_transfer.md](09_test_case_transfer.md) | 08 |
| 10 | テスト実行の作成と管理 | [10_test_run.md](10_test_run.md) | 08 |
| 11 | 実行結果の記録と進捗表示 | [11_test_result.md](11_test_result.md) | 10 |
| 12 | 実行結果へのコメント・添付ファイル | [12_test_result_note.md](12_test_result_note.md) | 11 |
| 13 | 不具合管理 | [13_defect.md](13_defect.md) | 11 |
| 14 | テストケース分析 | [14_analytics.md](14_analytics.md) | 13 |

## 依存関係

```text
01 管理者認証 ─┬─ 02 ワークスペース管理 ─┐
               └─ 03 アカウント設定 ──────┴─ 04 ワークスペース選択・招待
                                              └─ 05 プロダクト・バージョン
                                                   └─ 06 テストスイート
                                                        └─ 07 テストケース
                                                             └─ 08 レビュー・承認
                                                                  ├─ 09 コピー・CSV
                                                                  └─ 10 テスト実行
                                                                       └─ 11 実行結果
                                                                            ├─ 12 コメント・添付
                                                                            └─ 13 不具合管理
                                                                                 └─ 14 分析
```

09は10以降と独立しているため、後回しにしても他のスコープをブロックしません。

## 各スコープの進め方

`開発方針.md` のとおり、テーブル・APIスキーマ・エンドポイント・区分値・エラーコード・画面の定義は `generator/src/seed/` に追加し、`sampleapp local generate` で生成物を最新化します。生成されないのは以下です。

- `apps/api/src/service/`（ビジネスロジック層）
- `apps/api/src/repository/`（永続化層）
- `apps/api/src/handler/handlers/`（ハンドラの実処理）
- `apps/frontend` の画面実装（生成されるのはEntryPointとルーター定義のみ）

作業順序の目安は次のとおりです。

1. `generator/src/seed/` に区分値・エンティティ・テーブル・エラーコード・APIスキーマ・エンドポイント・画面を定義する
2. `sampleapp local generate` を実行して生成物を更新する
3. repository → service → handler の順に実装する
4. 統合テスト（テスト用DBへ接続）を追加する
5. フロントエンドの画面・Storybookストーリーを実装する
6. `npm run lint` / `npm run type-check` / APIのテストを通す
