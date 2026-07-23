#!/bin/bash

set -euo pipefail

docker compose -f "$COMPOSE_FILE_PATH" exec api cargo fmt -- --check
docker compose -f "$COMPOSE_FILE_PATH" exec api cargo clippy -- -D warnings
