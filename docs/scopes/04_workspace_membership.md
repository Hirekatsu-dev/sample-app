# スコープ04: ワークスペースの選択・切替・招待

## 目的

メンバーがログイン後に利用するワークスペースを決め、以降のAPIがワークスペースの文脈で動くようにする。あわせて、メンバーが別のユーザーを招待できるようにする。

## 対象要件

- ユーザーは初回、または最後に利用したワークスペースが現在利用できない場合に、ログイン後ワークスペースを選択してホーム画面に移動する
- ユーザーは利用中のワークスペースを切り替えることができる
- ユーザーはワークスペースに別のユーザーを招待できる

## 前提スコープ

- 02 ワークスペース管理（管理画面）
- 03 アカウント設定とパスワード再発行（メール送信基盤を利用する）

## 実施内容

### seed定義

| 種別 | 追加するもの |
| --- | --- |
| kbns | `invitation_status`（`pending`: 招待中 / `accepted`: 受諾済み / `expired`: 失効） |
| entity_ids | `WorkspaceInvitationId` |
| entities | `workspace_invitation`（`id` / `workspace_id` / `email` / `status_kbn` / `token_code` / `expires_at` / `invited_user_id`） |
| tables | `workspace_invitations`。`users` に `last_workspace_id`（NULL許可）を追加する |
| api_schemas | `WorkspaceSummary`（メンバー向け）、`SwitchWorkspaceRequest`、`CreateInvitationRequest`、`InvitationDetail`、`AcceptInvitationRequest` |
| api_endpoints | `GET /v1/workspaces`（所属ワークスペース一覧）、`GET /v1/workspaces/current`、`PUT /v1/workspaces/current`、`GET/POST /v1/workspaces/current/invitations`、`DELETE /v1/workspaces/current/invitations/{invitation_id}`、`GET /invitations/{token}`（認証不要）、`POST /invitations/{token}/accept`（認証不要） |
| errors | ワークスペース未所属、ワークスペースが無効、招待済みメールアドレスの重複、最大ユーザー数の超過、招待トークンの無効・期限切れ |
| pages | `WorkspaceSelect`、`WorkspaceMemberList`、`InvitationAccept` |

### API

- `extractor.rs` に、利用中ワークスペースを解決するExtractorを追加する
  - セッションから利用中の `workspace_id` を取得し、所属していない・無効化されている場合はエラーを返す
  - 以降のスコープのAPIはすべてこのExtractorを経由してワークスペースを特定する
- `service/workspace_context.rs`
  - ログイン直後は `users.last_workspace_id` を確認し、有効かつ所属しているならそのワークスペースを利用中にする
  - 利用できない場合はワークスペース未選択状態を返し、フロントエンドは選択画面へ遷移する
  - 切替時に `users.last_workspace_id` を更新する
- `service/invitation.rs`
  - 招待作成時、対象ワークスペース行を `SELECT ... FOR UPDATE` でロックし、既存メンバー数と有効な招待中の件数の合計が `max_user_count` を超えないことを検証してから招待を作成するまでを同一トランザクション内で原子的に行う
  - 招待メールを送信する（スコープ03のメール送信モジュールを利用）
  - 受諾時、対象ワークスペース行を `SELECT ... FOR UPDATE` でロックし、既存メンバー数が `max_user_count` を超えないことを検証したうえで、`workspace_users` への追加（未登録メールならユーザーを新規作成、登録済みなら既存ユーザーを紐づけ）と招待ステータスの更新までを同一トランザクション内で原子的に行う（複数招待の同時受諾による上限超過を防ぐ。最終的な上限保証はこの受諾時に行う）

### フロントエンド

- ワークスペース選択画面（所属が1件のみの場合も選択画面を経由せず自動遷移させない／挙動はUIで統一する）
- ヘッダーにワークスペース切替のUIを追加する
- ワークスペースのメンバー一覧と招待フォーム、招待中一覧の取り消し
- 招待URLから遷移する受諾画面（ユーザー名とパスワードの設定）
- Storybookストーリーを作成する

## テスト

- 初回ログイン時にワークスペース未選択となること
- 最後に利用したワークスペースが無効化されている場合に未選択となること
- 所属していないワークスペースへの切替がエラーになること
- 招待の作成・受諾（未登録メール / 登録済みメール）・期限切れ・重複招待
- 最大ユーザー数に達している場合に招待できないこと
- 残り1枠に対して複数の招待が同時に受諾されても、最大ユーザー数を超えて追加されないこと

## 完了条件

- ログイン後にワークスペースを選択・切替でき、招待から新しいメンバーが参加できる
- API統合テストとフロントエンドのlint・type-checkが通る

## 判断が必要な点

- **利用中ワークスペースの保持場所**: セッション（`user_sessions`）に保持し、次回ログイン時の初期値として `users.last_workspace_id` を使う。リクエストごとにヘッダーで渡す方式は取らない（切替の状態がクライアント任せになるため）。
- **招待の受諾に必要な情報**: 受諾時にユーザー名とパスワードを設定させる。管理者が追加する最初のユーザー（スコープ02）とは登録経路が異なる点に注意する。
