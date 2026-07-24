import { user } from '@seed/entities';
import { defineTable } from '../base';

export const usersTable = defineTable({
  name: 'users',
  description: 'ユーザー',
  columns: [
    user.tableColumn('id'),
    user.tableColumn('name'),
    user.tableColumn('email'),
    user.tableColumn('password'),
  ] as const,
  primaryKeys: ['id'],
  indices: [
    {
      columns: ['email'],
      type: 'btree',
      unique: true,
    },
  ],
});

// users は他テーブルへの外部キーを持たない
export const usersTableForeignKeys = [];
