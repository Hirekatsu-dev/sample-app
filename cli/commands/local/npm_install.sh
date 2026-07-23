#!/bin/bash

set -euo pipefail

log_info "コンテナ内で npm install を実行中..."
docker compose -f "$COMPOSE_FILE_PATH" exec frontend npm install

log_info "ホストで npm install を実行中..."
npm install --prefix "$PROJECT_ROOT/apps/frontend"

log_success "npm install が完了しました（コンテナ・ホスト両方）"
