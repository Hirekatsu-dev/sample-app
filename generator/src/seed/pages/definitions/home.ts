import { definePageDef, type PageDef } from '../base';

export const homePage = definePageDef({
  pname: 'Home',
  lname: 'ホーム画面',
  path: '/',
  description:
    'ホーム画面。APIとデータベースへの疎通状況（ヘルスチェック）を表示する。',
  requiresAuth: false,
  apis: [],
} satisfies PageDef);
