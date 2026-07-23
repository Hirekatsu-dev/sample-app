import { defineTable } from '../base';
import { defineForeignKey, referencesTable } from '../foreign_key_helpers';

export const userSessionsTable = defineTable({
  name: 'user_sessions',
  description: 'ユーザーのログインセッションを管理するテーブル',
  columns: [
    // 主キー
    { domain: 'ID' },

    {
      pname: 'user',
      domain: 'ID',
      description: 'セッションに紐づくユーザーのID',
    },

    // トークン情報
    {
      pname: 'access_token',
      lname: 'アクセストークン',
      domain: 'コード',
      description: 'API認証用のトークン',
    },
    {
      pname: 'expire',
      lname: '失効',
      domain: '日時',
      description: 'セッションの有効期限',
    },
  ] as const,

  primaryKeys: ['id'],
  indices: [
    {
      columns: ['access_token_code'],
      type: 'btree',
      unique: true,
    },
  ],
});

export const userSessionsTableForeignKeys = [
  defineForeignKey({
    sourceTable: 'user_sessions',
    columns: ['user_id'],
    ...referencesTable('users', ['id'], {
      onDelete: 'SET NULL',
      onUpdate: 'RESTRICT',
      relationship: 'one-to-many',
      allowZeroChildren: true,
    }),
  }),
];
