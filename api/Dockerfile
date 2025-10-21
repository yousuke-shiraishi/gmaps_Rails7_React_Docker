# syntax = docker/dockerfile:1

ARG RUBY_VERSION=3.2.4
FROM docker.io/library/ruby:${RUBY_VERSION}-slim AS base

WORKDIR /rails

# ---- ランタイム最低限（本番/開発共通）----
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    curl ca-certificates tini bash locales tzdata \
    build-essential pkg-config \
    libjemalloc2 libvips \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

# ロケール（手軽に C.UTF-8 を既定に）
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8

# 開発デフォルト（本番は compose/build-arg で上書き）
ENV BUNDLE_PATH="/rails/vendor/bundle" \
    BUNDLE_WITHOUT="" \
    BUNDLE_FROZEN="false"

# ---------------- Build stage ----------------
FROM base AS build

# ネイティブ拡張のビルドに必要なツール/ヘッダ類
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    build-essential make gcc g++ pkg-config git \
    libxml2-dev libxslt-dev zlib1g-dev \
    libpq-dev \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

# 依存だけ先に入れて bundle レイヤをキャッシュ
COPY Gemfile Gemfile.lock ./
RUN bundle config set path "${BUNDLE_PATH}" \
    && bundle config set frozen "${BUNDLE_FROZEN}" \
    && bundle install \
    && rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git \
    && bundle exec bootsnap precompile --gemfile

# アプリ本体
COPY . .

# アプリコードの bootsnap（任意）
RUN bundle exec bootsnap precompile app/ lib/

# ---------------- Final stage ----------------
FROM base

# tini を PID1 に
ENTRYPOINT ["tini","-g","--"]

# buildで作った bundle / app をコピー（これだけでOK）
COPY --from=build /rails /rails

# jemalloc を使うなら有効化（arm64 Debian の例）
# ENV LD_PRELOAD=/usr/lib/aarch64-linux-gnu/libjemalloc.so.2

# 非rootで動かす
RUN groupadd --system --gid 1000 rails \
    && useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash \
    && chown -R rails:rails db log storage tmp
USER 1000:1000

EXPOSE 3000
##CMD ["bash","-lc","bundle exec rdbg --open --host 0.0.0.0 --port 12345 --nonstop -- bin/rails s -b 0.0.0.0 -p 3000"]
