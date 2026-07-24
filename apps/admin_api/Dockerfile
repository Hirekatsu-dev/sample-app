ARG RUST_VERSION=1.92.0
ARG TARGET_PLATFORM=linux/amd64
ARG BACON_VERSION=3.22.0
ARG CARGO_EDIT_VERSION=0.13.9

# 開発環境
FROM rust:${RUST_VERSION}-slim-bookworm AS dev
ARG BACON_VERSION
ARG CARGO_EDIT_VERSION
WORKDIR /app
RUN cargo install --locked bacon@${BACON_VERSION} && \
  cargo install --locked cargo-edit@${CARGO_EDIT_VERSION} && \
  rustup component add rustfmt clippy

EXPOSE 3001

# 本番ビルド
ARG RUST_VERSION
ARG TARGET_PLATFORM
FROM --platform=${TARGET_PLATFORM} rust:${RUST_VERSION}-slim-bookworm AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

# 本番実行環境（Distroless: シェルや不要ツールを含まず脆弱性が少ない）
ARG TARGET_PLATFORM
FROM --platform=${TARGET_PLATFORM} gcr.io/distroless/cc-debian12 AS prod
COPY --from=builder /app/target/release/app /usr/local/bin/app
EXPOSE 3001
CMD ["/usr/local/bin/app"]
