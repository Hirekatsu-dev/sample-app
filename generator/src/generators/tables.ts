import {
  foreignKeys as foreignKeysInput,
  tables as tablesInput,
} from '../seed/tables';
import { buildApiMigrationsTestSetupStartText } from './builders/backend/test_setup';
import { buildDbSqlTablesText } from './builders/db/create_table';
import { buildDbSqlForeignKeysText } from './builders/db/foreign_key';
import { buildERDiagramText } from './builders/docs/erd/er_diagram';
import { buildTableDocumentText } from './builders/docs/erd/table_details';
import { Table } from './tables/table';
import { clear, render } from './util';

/*
# テーブルに関するコードを生成する
## 生成物一覧
- apps/api/migrations/test_setup_start.sql
  - テスト時のDB初期化用
- db/sql/tables/{table_name}.sql
  - ローカルでの開発用
- docs/database/er-diagram.md
  - ER図（Mermaid形式）
- docs/database/tables/{table_name}.md
  - 各テーブルの説明
*/

const reset = () => {
  clear('apps/api/migrations/test_setup_start.sql');
  clear('db/sql/tables');
  clear('db/sql/foreign_keys');
  clear('docs/database/er-diagram.md');
  clear('docs/database/tables');
};

export const generateTables = () => {
  const tables = tablesInput.map(
    (t) =>
      new Table(
        t,
        foreignKeysInput.filter((fk) => fk.sourceTable === t.name),
      ),
  );

  reset();

  render(
    buildApiMigrationsTestSetupStartText(tables),
    'apps/api/migrations/test_setup_start.sql',
  );

  for (const table of tables) {
    render(buildDbSqlTablesText(table), `db/sql/tables/${table.name}.sql`);

    // 外部キー制約がある場合のみファイルを生成
    if (table.foreignKeyConstraints !== '') {
      render(
        buildDbSqlForeignKeysText(table),
        `db/sql/foreign_keys/${table.name}.sql`,
      );
    }

    // テーブルドキュメントを生成
    render(
      buildTableDocumentText(table),
      `docs/database/tables/${table.name}.md`,
    );
  }

  render(buildERDiagramText(tables), 'docs/database/er-diagram.md');
};
