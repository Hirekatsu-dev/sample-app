import type { ApiSchema } from '../../types';

export const authSchemas = [
  {
    name: 'PostLoginRequestParams',
    description: 'ログインパラメータ',
    properties: [
      {
        name: 'email',
        type: 'string',
        format: 'email',
        description: 'メールアドレス',
        required: true,
        example: 'user@example.com',
      },
      {
        name: 'password',
        type: 'string',
        description: 'パスワード',
        required: true,
        example: 'password',
      },
    ],
  },
  {
    name: 'PostLoginResponseData',
    description: 'ログインレスポンス',
    // アクセストークンは httpOnly Cookie でのみ返す。
    // JS から読めるレスポンスボディには含めない。
    properties: [
      {
        name: 'user_id',
        type: 'string',
        format: 'uuid',
        entityId: 'UserId',
        description: 'ユーザーID',
        required: true,
        example: '49f3e8b0-9bf6-4269-9d74-6fbd9fcc74a7',
      },
    ],
  },
] as const satisfies ApiSchema[];
