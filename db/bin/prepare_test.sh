#!/bin/bash

set -eu -o pipefail

# テストDB作成
DB_EXISTS=$(psql -h localhost -U postgres web -Atc "SELECT 1 FROM pg_database WHERE datname = 'test'")

if [ "$DB_EXISTS" = "1" ]; then
  echo "Database 'test' already exists. Skipping creation."
else
  psql -h localhost -U postgres web -f ../sql/create_test_db.sql
fi

# テーブルの初期化
bash ./initialize_all.sh test
