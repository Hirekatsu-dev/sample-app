#!/bin/bash

set -eu -o pipefail

# DB名を引数から取得、デフォルトは"web"
DB_NAME="${1:-web}"

TMP_FILE=./tmp_initialize_table.sql

# 指定ディレクトリ配下の *.sql を名前順に連結する。
# ディレクトリが存在しない場合（generator でテーブル未定義のとき）は何もしない。
collect_sql() {
  local dir="$1"
  if [ -d "$dir" ]; then
    find "$dir" -name '*.sql' -print0 | sort -z | xargs -0 -r cat
  fi
}

{
  # スキーマ初期化
  cat ./../sql/initialize_schema.sql

  # テーブル定義
  collect_sql ./../sql/tables

  # 外部キー制約をまとめて最後に追加
  collect_sql ./../sql/foreign_keys
} > "$TMP_FILE"

# 実行
psql -h localhost -U postgres "$DB_NAME" -f "$TMP_FILE"

# まとめたsqlファイルを削除
rm "$TMP_FILE"
