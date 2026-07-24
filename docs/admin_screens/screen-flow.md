# 画面遷移図

このファイルは generator/src/generators/pages.ts から生成されます。
直接編集しないでください。

## 画面一覧

- [管理ホーム画面(AdminHome)](./pages/admin_home.md)

## 凡例

- 🔒 認証が必要な画面
- 緑枠: 公開画面
- 青枠: 認証必須画面

## 画面遷移図

```mermaid
flowchart TD

AdminHome["管理ホーム画面"]

    %% 画面遷移

    %% スタイル
    classDef public fill:#f0fdf4,stroke:#16a34a,stroke-width:1px
    class AdminHome public
```
