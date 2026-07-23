#!/bin/bash

set -euo pipefail

docker compose -f "$COMPOSE_FILE_PATH" exec db psql -U postgres -d web
