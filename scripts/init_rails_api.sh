#!/usr/bin/env bash
set -euo pipefail

if [ ! -f "api/Gemfile" ]; then
  echo "==> Generating Rails 7 API in ./api ..."
  docker run --rm -it -v "$PWD/api":/app -w /app ruby:3.2 bash -lc "
    gem install bundler -N &&
    gem install rails -v 7.2.1 -N &&
    rails new . --api -T -d postgresql --skip-hotwire --skip-system-test
  "
else
  echo "==> Rails app already exists at ./api; skipping rails new."
fi

echo "==> Adding common gems ..."
docker run --rm -it -v "$PWD/api":/app -w /app ruby:3.2 bash -lc "
  bundle add rack-cors jbuilder kaminari &&
  bundle add rspec-rails factory_bot_rails faker --group development,test || true
"

echo "==> Building docker images ..."
docker compose build

# Ensure cors initializer exists
if [ ! -f "api/config/initializers/cors.rb" ]; then
  mkdir -p api/config/initializers
  cat > api/config/initializers/cors.rb <<'RUBY'
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch('CORS_ORIGINS', '*').split(',').map(&:strip)
    resource '*',
      headers: :any,
      expose: %w[Authorization],
      methods: %i[get post put patch delete options head]
  end
end
RUBY
fi

echo "==> Starting services ..."
docker compose up -d

echo "==> Preparing DB & health endpoint ..."
docker compose exec api bash -lc "
  bin/rails db:create db:migrate &&
  bin/rails g controller api/v1/health show --no-test-framework || true
"

ROUTES_FILE="api/config/routes.rb"
if ! grep -q 'api/v1/health' "$ROUTES_FILE"; then
  echo '==> Adding /api/v1/health route ...'
  python3 - "$ROUTES_FILE" <<'PY'
import sys
p = sys.argv[1]
content = open(p).read()
needle = "Rails.application.routes.draw do"
insert = """namespace :api do
    namespace :v1 do
      get :health, to: 'health#show'
    end
  end"""
if needle in content and "health#show" not in content:
    lines = content.splitlines()
    for i,l in enumerate(lines):
        if l.strip() == needle:
            lines.insert(i+1, "  " + insert.replace("\n", "\n  "))
            break
    open(p, "w").write("\n".join(lines))
else:
    print("WARN: could not insert route automatically", file=sys.stderr)
PY
fi

echo "==> Done. Try:"
echo "   curl http://localhost:3000/api/v1/health"
echo "   curl http://localhost:8080/api/v1/health"
