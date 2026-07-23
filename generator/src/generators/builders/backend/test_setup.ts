import type { Table } from '../../tables/table';

export const buildApiMigrationsTestSetupStartText = (tables: Table[]) => {
  const tableDdls = tables.map((t) => t.ddlText).join('\n\n');
  const foreignKeyConstraints = tables
    .map((t) => t.foreignKeyConstraints)
    .filter((constraints) => constraints !== '')
    .join('\n');

  const content = [
    '-- このファイルは generator/src/generators/tables.ts から生成されます。',
    '-- 直接編集しないでください。',
    '',
    tables.length === 0 ? '-- テーブルは存在しません。' : tableDdls,
    '',
    foreignKeyConstraints === ''
      ? undefined
      : '-- 外部キー制約をまとめて最後に追加',
    foreignKeyConstraints === '' ? undefined : foreignKeyConstraints,
    '',
  ];

  return content.filter((line) => line !== undefined).join('\n');
};
