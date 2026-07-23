import { ERDiagram } from '../../../tables/er_diagram';
import type { Table } from '../../../tables/table';

export const buildERDiagramText = (tables: Table[]) => {
  const erDiagram = new ERDiagram(tables);

  const tableLinks = [...tables]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => `- [${t.name}](./tables/${t.name}.md)`)
    .join('\n');

  const content = [
    '# ER図',
    '',
    'このファイルは generator/src/generators/tables.ts から生成されます。',
    '直接編集しないでください。',
    '',
    '## テーブル一覧',
    '',
    tableLinks,
    '',
    '## ER図',
    '',
    '```mermaid',
    erDiagram.mermaidText,
    '```',
    '',
  ];

  return content.join('\n');
};
