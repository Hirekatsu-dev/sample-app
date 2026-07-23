import { definePageDef, type PageDef, withNavigations } from '../base';

export const loginPage = withNavigations(
  definePageDef({
    pname: 'Login',
    lname: 'ログイン画面',
    path: '/login',
    description: 'ログイン画面。メールアドレスとパスワードでログインする。',
    requiresAuth: false,
    apis: [
      { operationId: 'login', description: 'ログイン処理' },
      { operationId: 'get_me', description: 'ログイン後のユーザー情報取得' },
    ],
  } satisfies PageDef),
  [{ to: 'Home', label: 'ホームへ', condition: 'ログイン成功時' }],
);
