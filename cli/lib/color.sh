#!/bin/bash

# 端末が色出力をサポートしているか確認
if [[ -t 1 && "$TERM" != "dumb" ]]; then
  RED=$(tput setaf 1)
  GREEN=$(tput setaf 2)
  YELLOW=$(tput setaf 3)
  BLUE=$(tput setaf 4)
  MAGENTA=$(tput setaf 5)
  CYAN=$(tput setaf 6)
  BOLD=$(tput bold)
  RESET=$(tput sgr0)
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""
  MAGENTA=""; CYAN=""; BOLD=""; RESET=""
fi

export RED GREEN YELLOW BLUE MAGENTA CYAN BOLD RESET
