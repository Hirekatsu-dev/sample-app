#!/bin/bash

set -euo pipefail

docker compose -f "$COMPOSE_FILE_PATH" exec admin_frontend npm run lint "$@"
