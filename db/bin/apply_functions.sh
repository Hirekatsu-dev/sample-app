#!/bin/bash

set -eu -o pipefail

# DB名を引数から取得、デフォルトは"web"
DB_NAME="${1:-web}"

TMP_FILE=./tmp_initialize_functions.sql

# 既存の関数を1つのsqlファイルにまとめる
find ./../sql/functions -name '*.sql' -print0 | sort -z | xargs -0 -r cat > "$TMP_FILE"

# 実行
psql -h localhost -U postgres "$DB_NAME" -f "$TMP_FILE"

# まとめたsqlファイルを削除
rm "$TMP_FILE"
