import type { ApiEndpointGroup } from '../../types';

export const authEndpoints: ApiEndpointGroup = {
  name: 'auth',
  basePath: '/auth',
  description: '認証関連のエンドポイント',
  endpoints: [
    {
      path: '/login',
      method: 'POST',
      operationId: 'login',
      summary: 'ユーザーログイン',
      description: 'メールアドレスとパスワードでログインする',
      tags: ['auth'],
      requestBody: {
        required: true,
        schema: 'PostLoginRequestParams',
      },
      successResponse: {
        type: 'data',
        dataSchema: 'PostLoginResponseData',
      },
      errorResponses: [{ name: 'パラメータ不正' }, { name: 'ログイン失敗' }],
      cookieResponse: true,
    },
    {
      path: '/logout',
      method: 'POST',
      operationId: 'logout',
      summary: 'ユーザーログアウト',
      description: 'ログアウトしてセッションを破棄する',
      tags: ['auth'],
      successResponse: { type: 'empty' },
      errorResponses: [{ name: 'セッション失効' }],
      security: ['BearerAuth'],
      cookieResponse: true,
    },
  ],
};
