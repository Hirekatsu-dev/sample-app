import type { Table } from '../../tables/table';

export const buildDbSqlTablesText = (table: Table) => {
  const content = [
    '-- このファイルは generator/src/generators/tables.ts から生成されます。',
    '-- 直接編集しないでください。',
    '',
    table.ddlText,
    '',
  ];

  return content.join('\n');
};
