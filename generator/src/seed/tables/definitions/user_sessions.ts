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
      // FK 列なので既定のランダム UUID を持たせず、INSERT 時に必ず明示させる。
      default: '',
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
      // user_id は NOT NULL なので SET NULL は使えない。
      // ユーザー削除時はセッションも破棄する。
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
      relationship: 'one-to-many',
      allowZeroChildren: true,
    }),
  }),
];
