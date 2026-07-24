#!/bin/bash

set -euo pipefail

TEST_COMMAND_ROOT="$COMMAND_ROOT/local/test"

# コマンドに応じて処理を振り分け
CMD="${1:-}"
shift || true

print_test_usage() {
  echo -e "${BOLD}USAGE:${RESET}"
  echo -e "  sampleapp local test <command> [options]"
  echo

  echo -e "${BOLD}COMMANDS:${RESET}"
  printf "  ${YELLOW}%-12s${RESET} %s\n" "prepare"  "テストDBを準備"
  printf "  ${YELLOW}%-12s${RESET} %s\n" "api"  "APIの自動テストを実行する"
  printf "  ${YELLOW}%-12s${RESET} %s\n" "admin-api"  "管理APIの自動テストを実行する"
  printf "  ${YELLOW}%-12s${RESET} %s\n" "help"   "ヘルプメッセージを表示"
  echo
}

case "$CMD" in
  prepare)
    # shellcheck source=/dev/null
    source "$TEST_COMMAND_ROOT/prepare.sh" "$@"
    ;;
  api)
    # shellcheck source=/dev/null
    source "$TEST_COMMAND_ROOT/api.sh" "$@"
    ;;
  admin-api)
    # shellcheck source=/dev/null
    source "$TEST_COMMAND_ROOT/admin_api.sh" "$@"
    ;;
  help)
    print_test_usage
    ;;
  *)
    print_test_usage
    exit 1
    ;;
esac
