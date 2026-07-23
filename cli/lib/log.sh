#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=/dev/null
source "$SCRIPT_DIR/color.sh"

# ログレベル定義（数値の小さい方が詳細）
LOG_LEVELS=("DEBUG" "INFO" "WARN" "ERROR")
LOG_LEVEL="${LOG_LEVEL:-INFO}"

get_log_level_index() {
  local level="$1"
  for i in "${!LOG_LEVELS[@]}"; do
    [[ "${LOG_LEVELS[$i]}" == "$level" ]] && echo "$i" && return
  done
  echo 1  # デフォルト: INFO
}

# ログ出力の共通関数
_log_msg() {
  local level="$1"
  local color="$2"
  local msg="$3"

  local current_level_idx
  local this_msg_level_idx

  current_level_idx=$(get_log_level_index "$LOG_LEVEL")
  this_msg_level_idx=$(get_log_level_index "$level")

  if (( this_msg_level_idx >= current_level_idx )); then
    echo -e "${BOLD}${color}[${level}]${RESET} $msg"
  fi
}

log_debug()   { _log_msg "DEBUG" "$CYAN"   "$*"; }
log_info()    { _log_msg "INFO"  "$BLUE"   "$*"; }
log_warn()    { _log_msg "WARN"  "$YELLOW" "$*"; }
log_error()   { _log_msg "ERROR" "$RED"    "$*" >&2; }
log_success() { echo -e "${BOLD}${GREEN}[OK]${RESET} $*"; }

log_timestamp() {
  local message="$*"
  local timestamp
  timestamp=$(TZ='Asia/Tokyo' date +"%Y-%m-%d %H:%M:%S")
  log_info "$timestamp - $message"
}
