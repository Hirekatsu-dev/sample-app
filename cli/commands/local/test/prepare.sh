#!/bin/bash

set -euo pipefail

# テストDBの初期化
docker compose -f "$COMPOSE_FILE_PATH" exec db bash -c "cd bin && bash ./prepare_test.sh"
