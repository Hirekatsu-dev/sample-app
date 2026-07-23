import type { Table } from '../../../tables/table';

export const buildTableDocumentText = (table: Table) => {
  const content: string[] = [
    `# ${table.name}`,
    '',
    '[← ER図に戻る](../er-diagram.md)',
    '',
    'このファイルは generator/src/generators/tables.ts から生成されます。',
    '直接編集しないでください。',
    '',
  ];

  // テーブルの説明がある場合は追加
  if (table.description) {
    content.push(table.description, '');
  }

  content.push(
    '## カラム一覧',
    '',
    '| 物理名 | 論理名 | 型 | NOT NULL | デフォルト値 | 説明 |',
    '|--------|--------|-----|----------|-------------|------|',
  );

  // カラム情報を追加
  for (const column of table.columns) {
    const notNull = column.notNull ? '✓' : '';
    const defaultValue = column.default || '';
    const description = column.description || '';
    // 区分カラムの場合はkbn.mdへのリンクを追加
    const pnameWithLink = column.kbn
      ? `[${column.pname}](../../constants/kbn.md#${column.kbn}_kbn)`
      : column.pname;
    content.push(
      `| ${pnameWithLink} | ${column.lname} | ${column.type} | ${notNull} | ${defaultValue} | ${description} |`,
    );
  }

  // 主キー情報
  if (table.primaryKeys.length > 0) {
    content.push('', '## 主キー', '');
    content.push(`- ${table.primaryKeys.join(', ')}`);
  }

  // ユニークキー情報
  if (table.uniqueKeys.length > 0) {
    content.push('', '## ユニーク制約', '');
    for (const keys of table.uniqueKeys) {
      content.push(`- (${keys.join(', ')})`);
    }
  }

  // インデックス情報
  if (table.indices.length > 0) {
    content.push('', '## インデックス', '');
    content.push('| 名前 | カラム | ユニーク | 種類 |');
    content.push('|------|--------|----------|------|');
    for (const index of table.indices) {
      const unique = index.unique ? '✓' : '';
      const indexType = index.type || 'btree';
      content.push(
        `| ${index.name} | ${index.columns.join(', ')} | ${unique} | ${indexType} |`,
      );
    }
  }

  // 外部キー情報
  if (table.foreignKeys.length > 0) {
    content.push('', '## 外部キー制約', '');
    content.push(
      '| カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |',
    );
    content.push(
      '|--------|----------------|--------------|-----------|-----------|',
    );
    for (const fk of table.foreignKeys) {
      const referencedTableLink = `[${fk.referencedTable}](./${fk.referencedTable}.md)`;
      content.push(
        `| ${fk.columns.join(', ')} | ${referencedTableLink} | ${fk.referencedColumns.join(', ')} | ${fk.onDelete} | ${fk.onUpdate} |`,
      );
    }
  }

  content.push('');

  return content.join('\n');
};
