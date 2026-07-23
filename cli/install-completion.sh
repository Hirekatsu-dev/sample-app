#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASHRC_FILE="$HOME/.bashrc"
BASH_PROFILE_FILE="$HOME/.bash_profile"
ZSHRC_FILE="$HOME/.zshrc"

# 現在のシェルを検出
CURRENT_SHELL="$(basename "$SHELL")"

echo "Detected shell: $CURRENT_SHELL"
echo "Installing sampleapp completion for $CURRENT_SHELL..."

# シェル別の補完スクリプトとファイルを設定
if [[ "$CURRENT_SHELL" == "zsh" ]]; then
    COMPLETION_SCRIPT="$SCRIPT_DIR/completions/sampleapp-completion.zsh"
    CONFIG_FILE="$ZSHRC_FILE"
    CONFIG_NAME=".zshrc"
else
    COMPLETION_SCRIPT="$SCRIPT_DIR/completions/sampleapp-completion.bash"
    # macOSの場合は.bash_profile、Linuxの場合は.bashrcを優先
    if [[ "$(uname)" == "Darwin" ]]; then
        if [[ -f "$BASH_PROFILE_FILE" ]] || [[ ! -f "$BASHRC_FILE" ]]; then
            CONFIG_FILE="$BASH_PROFILE_FILE"
            CONFIG_NAME=".bash_profile"
        else
            CONFIG_FILE="$BASHRC_FILE"
            CONFIG_NAME=".bashrc"
        fi
    else
        CONFIG_FILE="$BASHRC_FILE"
        CONFIG_NAME=".bashrc"
    fi
fi

# 補完スクリプトが存在するかチェック
if [[ ! -f "$COMPLETION_SCRIPT" ]]; then
    echo "Error: Completion script not found at $COMPLETION_SCRIPT"
    exit 1
fi

# 補完スクリプトのソース行
SOURCE_LINE="source \"$COMPLETION_SCRIPT\""

# 設定ファイルが存在しない場合は作成
if [[ ! -f "$CONFIG_FILE" ]]; then
    touch "$CONFIG_FILE"
fi

# 既に追加済みかチェック
if grep -Fxq "$SOURCE_LINE" "$CONFIG_FILE"; then
    echo "Completion already installed in $CONFIG_NAME"
else
    # ファイルに追加
    {
        echo ""
        echo "# sampleapp command completion"
        echo "$SOURCE_LINE"
    } >> "$CONFIG_FILE"
    echo "Added completion to $CONFIG_NAME"
fi

echo ""
echo "Installation complete!"
echo ""
echo "To activate the completion, run:"
echo "  source $CONFIG_FILE"
echo "  # または新しいシェルセッションを開始してください"
echo ""
echo "Usage examples:"
echo "  sampleapp [Tab]          # → local help"
echo "  sampleapp local [Tab]    # → docker build start restart stop ps logs exec shell pg prepare lint generate test help"
