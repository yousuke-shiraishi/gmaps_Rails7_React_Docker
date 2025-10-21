#!/usr/bin/env sh
set -e

# 残骸があっても安全に再起動できるように
mkdir -p tmp/pids
rm -f tmp/pids/server.pid

# DB 準備（migrate/seed を含む）
bin/rails db:prepare

# Rails 起動
exec bin/rails server -b 0.0.0.0 -p "${PORT:-3000}"
