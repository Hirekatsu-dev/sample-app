import { definePageDef, type PageDef } from '../base';

export const adminHomePage = definePageDef({
  pname: 'AdminHome',
  lname: '管理ホーム画面',
  path: '/',
  description:
    '管理画面のホーム。管理APIとデータベースへの疎通状況（ヘルスチェック）を表示する。',
  requiresAuth: false,
  apis: [],
} satisfies PageDef);
