#!/bin/bash

set -euo pipefail

docker compose -f "$COMPOSE_FILE_PATH" exec api cargo test -- --test-threads=1 "$@"
