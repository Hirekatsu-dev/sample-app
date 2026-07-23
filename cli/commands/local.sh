#!/bin/bash

set -euo pipefail

LOCAL_COMMAND_ROOT="$COMMAND_ROOT/local"

# コマンドに応じて処理を振り分け
CMD="${1:-}"

# 補完モードの処理
if [[ "$CMD" == "--completion" ]]; then
  echo "docker build start restart stop ps logs exec shell pg prepare lint generate test npm-install help"
  exit 0
fi

shift || true

print_local_usage() {
  echo -e "${BOLD}USAGE:${RESET}"
  echo -e "  sampleapp local <command> [options]"
  echo

  echo -e "${BOLD}COMMANDS:${RESET}"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "docker"  "Dockerコンテナを操作"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "build"  "Dockerコンテナをビルド"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "start"  "Dockerコンテナを起動"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "restart"  "Dockerコンテナを再起動"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "stop"   "Dockerコンテナを停止"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "ps"     "Dockerコンテナの状態を表示"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "logs"     "Dockerコンテナのログを表示"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "exec"   "Dockerコンテナ内でコマンドを実行"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "shell"  "Dockerコンテナ内のシェルを起動"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "pg"      "PostgreSQLコンテナに接続"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "prepare"      "開発環境の準備を行う"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "lint"      "リンティングを実行"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "generate"      "ソースコードの自動生成を実行"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "test"      "テスト用のコマンドを実行"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "browse"      "ブラウザで開発環境を開く"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "npm-install" "コンテナ・ホスト両方で npm install を実行"
  printf "  ${YELLOW}%-10s${RESET} %s\n" "help"   "ヘルプメッセージを表示"
  echo
}

case "$CMD" in
  docker)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/docker.sh" "$@"
    ;;
  build)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/build.sh" "$@"
    ;;
  start)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/start.sh" "$@"
    ;;
  stop)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/stop.sh" "$@"
    ;;
  restart)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/restart.sh" "$@"
    ;;
  ps)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/ps.sh" "$@"
    ;;
  logs)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/logs.sh" "$@"
    ;;
  exec | execute)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/execute.sh" "$@"
    ;;
  shell)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/shell.sh" "$@"
    ;;
  pg | postgres | database)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/pg.sh" "$@"
    ;;
  prepare)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/prepare.sh" "$@"
    ;;
  lint)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/lint.sh" "$@"
    ;;
  generate)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/generate.sh" "$@"
    ;;
  test)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/test.sh" "$@"
    ;;
  browse)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/browse.sh" "$@"
    ;;
  npm-install)
    # shellcheck source=/dev/null
    source "$LOCAL_COMMAND_ROOT/npm_install.sh" "$@"
    ;;
  help)
    print_local_usage
    ;;
  *)
    print_local_usage
    exit 1
    ;;
esac
