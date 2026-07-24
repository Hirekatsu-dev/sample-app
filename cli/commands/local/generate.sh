#!/bin/bash

set -euo pipefail

# 定義ファイルからコードを自動生成する
cd "$PROJECT_ROOT/generator" && npm run generate

# 生成された Rust を整形する（generator の出力は未整形のため cargo fmt をかける）
docker compose -f "$COMPOSE_FILE_PATH" exec -T api cargo fmt
docker compose -f "$COMPOSE_FILE_PATH" exec -T admin_api cargo fmt
