#!/bin/bash

# sampleappコマンドのbash補完スクリプト
_sampleapp_completion() {
    local cur="${COMP_WORDS[COMP_CWORD]}"
    local prev="${COMP_WORDS[COMP_CWORD-1]}"

    # sampleappコマンドのパスを解決
    local sampleapp_cmd="sampleapp"

    # PATHにsampleappが存在するかチェック
    if ! command -v "$sampleapp_cmd" &> /dev/null; then
        # PATHに存在しない場合、相対パスで試行
        local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        local project_root="$(cd "$script_dir/.." && pwd)"
        sampleapp_cmd="$project_root/cli/bin/sampleapp"

        # それでも存在しない場合は補完を無効化
        if [[ ! -x "$sampleapp_cmd" ]]; then
            return 0
        fi
    fi

    # 現在の補完位置に基づいて適切なコマンドを構築
    local completion_args=()
    for ((i=1; i<COMP_CWORD; i++)); do
        completion_args+=("${COMP_WORDS[i]}")
    done

    # sampleappコマンドから補完候補を取得
    local completions
    completions=$("$sampleapp_cmd" --completion "${completion_args[@]}" 2>/dev/null)

    # 補完候補を設定
    if [[ -n "$completions" ]]; then
        COMPREPLY=($(compgen -W "$completions" -- "$cur"))
    else
        COMPREPLY=()
    fi
}

# sampleappコマンドに補完機能を登録
complete -F _sampleapp_completion sampleapp