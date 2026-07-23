#!/bin/bash

set -euo pipefail

docker compose -f "$COMPOSE_FILE_PATH" exec frontend npm run lint "$@"
