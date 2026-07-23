FROM node:24-bookworm-slim

WORKDIR /app


# パッケージ一覧(インデックス)を更新
RUN apt update

# フロントエンドのパッケージ定義だけ先にコピー
COPY ./package.json ./

# フロントエンドのパッケージをインストール
RUN npm install

# プロジェクトをコピー
COPY ./ ./

# コンテナを公開
EXPOSE 8080
EXPOSE 6006
