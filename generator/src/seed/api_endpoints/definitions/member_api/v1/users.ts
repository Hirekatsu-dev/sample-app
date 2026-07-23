import type { ApiEndpointGroup } from '../../../types';

export const usersEndpoints: ApiEndpointGroup = {
  name: 'users',
  basePath: '/users',
  description: 'ユーザー関連のエンドポイント',
  endpoints: [
    {
      path: '/me',
      method: 'GET',
      operationId: 'get_me',
      summary: 'ログイン中のユーザー情報取得',
      description: 'アクセストークンに紐づくユーザーの情報を返す',
      tags: ['users'],
      successResponse: {
        type: 'data',
        dataSchema: 'GetMeResponseData',
      },
      errorResponses: [{ name: 'セッション失効' }],
      security: ['BearerAuth'],
    },
  ],
};
