# スコープ02: ワークスペース管理（管理画面）

## 目的

管理者がワークスペースを作成・設定・無効化し、ワークスペースの最初のユーザーを登録できるようにする。以降のすべての機能はワークスペースを起点にするため、テナントの器をここで作る。

## 対象要件

- 管理者はワークスペースを設定できる（名前 / 最大ユーザー数 / 最大プロダクト数 / 備考）
- 管理者はワークスペースを無効化できる（データは残し、ユーザー画面からは存在しない状態にする）
- 管理者はワークスペースに最初のユーザーを追加できる（ユーザー名 / メールアドレス）
- 管理者はワークスペースからユーザーを削除できる

## 前提スコープ

- 01 管理者認証と管理画面の基盤

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| kbns | `workspace_status`（`active`: 有効 / `inactive`: 無効） |
| entity_ids | `WorkspaceId`, `WorkspaceUserId` |
| entities | `workspace`（`id` / `name` / `status_kbn` / `max_user_count` / `max_product_count` / `note_description`） |
| tables | `workspaces`、`workspace_users`（`workspace_id` × `user_id` にユニークインデックス） |
| api_schemas | `WorkspaceSummary`, `WorkspaceDetail`, `CreateWorkspaceRequest`, `UpdateWorkspaceRequest`, `WorkspaceUserSummary`, `AddWorkspaceUserRequest` |
| api_endpoints | 管理API（`apps/admin_api`）に追加する。`GET/POST /api/v1/workspaces`、`GET/PUT /api/v1/workspaces/{workspace_id}`、`PUT /api/v1/workspaces/{workspace_id}/status`、`GET/POST /api/v1/workspaces/{workspace_id}/users`、`DELETE /api/v1/workspaces/{workspace_id}/users/{user_id}` |
| errors | ワークスペース名の重複、最大ユーザー数の超過、メールアドレスの重複 |
| pages | `AdminWorkspaceList`、`AdminWorkspaceDetail`、`AdminWorkspaceUserList` |

### API

- `repository/workspace.rs`, `repository/workspace_user.rs` を追加する
- `service/workspace.rs`
  - ワークスペースの作成・更新・状態変更
  - ユーザー追加時に `users` へレコードを作成し、`workspace_users` で紐づける
  - 上限チェックと追加は同一トランザクション内で原子的に行う。対象ワークスペース行を `SELECT ... FOR UPDATE` でロックしてから所属数を数え、`max_user_count` を超えないことを検証したうえで追加する（並行追加による上限超過を防ぐ）
  - ユーザー削除は `workspace_users` の論理削除（`public` → `garbage` への移動）で表現する
- 無効化は `workspaces.status_kbn` の変更で表現する（レコードは削除しない）

### フロントエンド

- ワークスペース一覧（状態での絞り込み、無効なワークスペースの視覚的な区別）
- ワークスペース作成・編集フォーム（最大ユーザー数・最大プロダクト数は1以上の整数）
- ワークスペースのユーザー一覧と追加・削除
- Storybookストーリーを作成する

## テスト

- ワークスペースの作成・更新・無効化・再有効化
- 最大ユーザー数に達した状態でのユーザー追加がエラーになること
- 既に登録済みのメールアドレスでのユーザー追加がエラーになること
- ユーザー削除後に `workspace_users` が `public` から消え `garbage` に存在すること

## 完了条件

- 管理者がワークスペースを作成・編集・無効化でき、ユーザーを追加・削除できる
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **追加ユーザーの初期パスワード**: 管理者は初期パスワードを直接設定せず、有効期限付きのパスワード設定トークンを発行し、ユーザー本人が初回に設定する方式とする（スコープ03のパスワード再発行と同じ仕組みを利用する）。トークンや認証情報を平文メール・ログへ出力しない。運用上どうしても管理者が初期パスワードを発行する場合は、短期間で失効する一時パスワードとし、初回ログイン時に変更を強制する。招待メールによる本人設定はスコープ04で扱う。
- **ワークスペース内のロール**: 要件に管理者／一般といったメンバー内の権限差がないため、`workspace_users` にロールは持たせない。将来必要になった場合に区分値として追加する。
- **ユーザーの所属数**: 1ユーザーが複数のワークスペースに所属できる前提とする（要件のワークスペース切替がこれを前提としているため）。
