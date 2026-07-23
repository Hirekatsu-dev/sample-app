#!/bin/bash

set -euo pipefail

# デフォルトのURL
DEFAULT_URL="http://localhost:8080"

# 引数処理
URL="${1:-$DEFAULT_URL}"

# ブラウザを開く
echo -e "${YELLOW}Opening browser: ${URL}${RESET}"

# OS別のブラウザ起動コマンド
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open "$URL"
    elif command -v gnome-open &> /dev/null; then
        gnome-open "$URL"
    else
        echo -e "${RED}Error: Could not detect the browser launcher${RESET}"
        exit 1
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    start "$URL"
else
    echo -e "${RED}Error: Unsupported OS type: $OSTYPE${RESET}"
    exit 1
fi

echo -e "${GREEN}Browser opened successfully${RESET}"
