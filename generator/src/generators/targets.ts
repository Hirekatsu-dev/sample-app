/*
# 生成対象のアプリケーション（ターゲット）定義

管理画面とユーザー画面はアプリケーションを分離しているため、生成物の出力先もターゲットごとに分ける。

- テーブル・区分値は DB を共有するため定義は共通とし、生成物のみ全ターゲットへ配布する。
- エラーコード・エンティティID・APIスキーマ・APIエンドポイント・画面はアプリケーション固有のため、
  ターゲットごとの定義から対応する出力先へ生成する。
*/

export type TargetKey = 'member' | 'admin';

export type AppTarget = {
  /** seed 定義を引くためのキー */
  key: TargetKey;
  /** 表示用の名前 */
  name: string;
  /** Rust APIサーバーのルート */
  backendRoot: string;
  /** フロントエンドのルート */
  frontendRoot: string;
  /** OpenAPI ドキュメントのルート */
  openApiRoot: string;
  /** 画面ドキュメントのルート */
  screenDocRoot: string;
};

export const appTargets = [
  {
    key: 'member',
    name: 'メンバー',
    backendRoot: 'apps/api',
    frontendRoot: 'apps/frontend',
    openApiRoot: 'docs/open_api/api',
    screenDocRoot: 'docs/screens',
  },
  {
    key: 'admin',
    name: '管理',
    backendRoot: 'apps/admin_api',
    frontendRoot: 'apps/admin_frontend',
    openApiRoot: 'docs/open_api/admin_api',
    screenDocRoot: 'docs/admin_screens',
  },
] as const satisfies readonly AppTarget[];
