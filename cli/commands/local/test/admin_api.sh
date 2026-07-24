#!/bin/bash

set -euo pipefail

docker compose -f "$COMPOSE_FILE_PATH" exec admin_api cargo test -- --test-threads=1 "$@"
