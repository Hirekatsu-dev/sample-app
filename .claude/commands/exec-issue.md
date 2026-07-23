---
description: GitHub Issueの内容を確認し、ブランチ作成・実装・品質チェック・コミット・PR作成までを一貫して実行する。
argument-hint: "[Issue番号]"
disable-model-invocation: true
---

gh issue view $ARGUMENTS でGitHubのIssueの内容を確認し、タスクの遂行を行なってください。

## 重要: 以下のすべての手順を必ず実行してください

**必ず最初にTodoWriteツールを使用して、以下の手順をTODOリストに登録してください。**
各手順の完了時には、TODOリストのステータスを更新してください。

### 実行手順（すべて必須）

1. **Issue内容の理解**
   - `gh issue view $ARGUMENTS` でIssueの詳細を確認
   - TodoWriteツールでタスクリストを作成

2. **ブランチの準備**
   - `git checkout main` でmainブランチに移動
   - `git pull origin main` で最新の状態を取得
   - `git checkout -b feature/issue-$ARGUMENTS` で新しいブランチを作成

3. **実装**
   - Issueの要件を満たす実装を行う
   - 必要に応じてテストを作成

4. **品質チェック**
   - `docker-compose exec frontend npm run test` でLintチェック
   - `docker-compose exec frontend npm run build` でビルド確認

5. **コミット作成**
   - 論理的な単位で複数のコミットに分割
   - CLAUDE_INSTRUCTIONS.mdのコミットメッセージ規則に従う

6. **プルリクエスト作成**
   - `git push -u origin [branch-name]` でプッシュ
   - `gh pr create` でPR作成

### チェックリスト
- [ ] TodoWriteでタスクリストを作成した
- [ ] すべての手順を順番に実行した
- [ ] コミットは適切な粒度で分割した
- [ ] PRに `Closes #$ARGUMENTS` を記載した
