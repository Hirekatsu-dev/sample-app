#!/bin/bash

set -euo pipefail

LINT_COMMAND_ROOT="$COMMAND_ROOT/local/lint"

# コマンドに応じて処理を振り分け
CMD="${1:-}"
shift || true

print_test_usage() {
  echo -e "${BOLD}USAGE:${RESET}"
  echo -e "  sampleapp local lint <command> [options]"
  echo

  echo -e "${BOLD}COMMANDS:${RESET}"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "all"  "リンティングを実行する"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "frontend"  "フロントエンドのリンティングを実行する"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "api"  "APIのリンティングを実行する"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "help"   "ヘルプメッセージを表示"
  echo
}

case "$CMD" in
  all)
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/frontend.sh" "$@"
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/api.sh" "$@"
    ;;
  frontend)
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/frontend.sh" "$@"
    ;;
  api)
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/api.sh" "$@"
    ;;
  help)
    print_test_usage
    ;;
  *)
    print_test_usage
    exit 1
    ;;
esac
