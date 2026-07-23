import { definePageDef, type PageDef, withNavigations } from '../base';

export const homePage = withNavigations(
  definePageDef({
    pname: 'Home',
    lname: 'ホーム画面',
    path: '/',
    description:
      'ホーム画面。APIとデータベースへの疎通状況（ヘルスチェック）を表示する。',
    requiresAuth: false,
    apis: [],
  } satisfies PageDef),
  [{ to: 'Login', label: 'ログイン' }],
);
