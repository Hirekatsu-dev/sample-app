#!/bin/bash

set -euo pipefail

# DBの初期化
docker compose -f "$COMPOSE_FILE_PATH" exec db bash -c "cd bin && bash ./prepare.sh"
