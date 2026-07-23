import { defineEntity, defineFields } from '../define_entity';

export const user = defineEntity({
  pname: 'user',
  lname: 'ユーザー',
  fields: defineFields([
    { domain: 'ID' },
    { domain: '名前', description: 'ユーザーの表示名' },
    { domain: 'Eメール', description: 'ログイン用メールアドレス' },
    {
      domain: 'パスワード',
      description: 'bcryptでハッシュ化されたパスワード',
    },
  ] as const),
});
