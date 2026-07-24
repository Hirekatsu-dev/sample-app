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
  printf "  ${YELLOW}%-16s${RESET} %s\n" "all"  "すべてのリンティングを実行する"
  printf "  ${YELLOW}%-16s${RESET} %s\n" "frontend"  "フロントエンドのリンティングを実行する"
  printf "  ${YELLOW}%-16s${RESET} %s\n" "api"  "APIのリンティングを実行する"
  printf "  ${YELLOW}%-16s${RESET} %s\n" "admin-frontend"  "管理画面フロントエンドのリンティングを実行する"
  printf "  ${YELLOW}%-16s${RESET} %s\n" "admin-api"  "管理APIのリンティングを実行する"
  printf "  ${YELLOW}%-16s${RESET} %s\n" "help"   "ヘルプメッセージを表示"
  echo
}

case "$CMD" in
  all)
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/frontend.sh" "$@"
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/api.sh" "$@"
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/admin_frontend.sh" "$@"
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/admin_api.sh" "$@"
    ;;
  frontend)
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/frontend.sh" "$@"
    ;;
  api)
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/api.sh" "$@"
    ;;
  admin-frontend)
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/admin_frontend.sh" "$@"
    ;;
  admin-api)
    # shellcheck source=/dev/null
    source "$LINT_COMMAND_ROOT/admin_api.sh" "$@"
    ;;
  help)
    print_test_usage
    ;;
  *)
    print_test_usage
    exit 1
    ;;
esac
