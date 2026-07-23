import type { Column, ExtractColumnName } from './base';

export const systemColumns = [
  {
    pname: 'created',
    domain: '日時',
  },
  {
    pname: 'updated',
    domain: '日時',
  },
  {
    pname: 'deleted',
    domain: '日時',
    notNull: false,
    default: 'NULL',
  },
  {
    pname: 'created',
    domain: 'ID',
  },
  {
    pname: 'updated',
    domain: 'ID',
  },
  { pname: 'deleted', domain: 'ID', notNull: false },
  {
    pname: 'meta',
    domain: 'JSON',
  },
] as const satisfies readonly Column[];

// システムカラムから実際のカラム名のユニオン型を生成
export type SystemColumnName = ExtractColumnName<
  (typeof systemColumns)[number]
>;
