#!/bin/bash

set -euo pipefail

docker compose -f "$COMPOSE_FILE_PATH" stop "$@"
