import type { Table } from '../../tables/table';

export const buildDbSqlForeignKeysText = (table: Table) => {
  const content = [
    '-- このファイルは generator/src/generators/tables.ts から生成されます。',
    '-- 直接編集しないでください。',
    '',
    table.foreignKeyConstraints,
    '',
  ];

  return content.join('\n');
};
