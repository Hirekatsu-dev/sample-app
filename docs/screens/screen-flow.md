# 画面遷移図

このファイルは generator/src/generators/pages.ts から生成されます。
直接編集しないでください。

## 画面一覧

- [ホーム画面(Home)](./pages/home.md)
- [ログイン画面(Login)](./pages/login.md)

## 凡例

- 🔒 認証が必要な画面
- 緑枠: 公開画面
- 青枠: 認証必須画面

## 画面遷移図

```mermaid
flowchart TD

Login["ログイン画面"]

Home["ホーム画面"]

    %% 画面遷移
    Login -->|ログイン成功時| Home
    Home -->|ログイン| Login

    %% スタイル
    classDef public fill:#f0fdf4,stroke:#16a34a,stroke-width:1px
    class Login,Home public
```
