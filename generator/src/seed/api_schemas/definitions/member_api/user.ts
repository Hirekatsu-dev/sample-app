import type { ApiSchema } from '../../types';

export const userSchemas = [
  {
    name: 'GetMeResponseData',
    description: 'ログイン中のユーザー情報',
    properties: [
      {
        name: 'id',
        type: 'string',
        format: 'uuid',
        entityId: 'UserId',
        description: 'ユーザーID',
        required: true,
        example: '49f3e8b0-9bf6-4269-9d74-6fbd9fcc74a7',
      },
      {
        name: 'name',
        type: 'string',
        description: '表示名',
        required: true,
        example: 'サンプル太郎',
      },
      {
        name: 'email',
        type: 'string',
        format: 'email',
        description: 'メールアドレス',
        required: true,
        example: 'user@example.com',
      },
    ],
  },
] as const satisfies ApiSchema[];
