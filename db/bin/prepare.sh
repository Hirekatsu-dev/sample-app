#!/bin/bash

set -eu -o pipefail

# テーブルの初期化
bash ./initialize_all.sh

# ローカル環境にデータを挿入
psql -h localhost -U postgres web -f ../sql/insert_sample_data.sql
