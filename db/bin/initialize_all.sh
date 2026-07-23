#!/bin/bash

set -euo pipefail

# DB名を引数から取得、デフォルトは"web"
DB_NAME="${1:-web}"

bash ./initialize_table.sh "$DB_NAME"
bash ./apply_functions.sh "$DB_NAME"
