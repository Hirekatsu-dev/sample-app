import type {
  Column as ColumnTemplate,
  ForeignKey as ForeignKeyTemplate,
  Index as IndexTemplate,
  Partition,
  Table as TableTemplate,
} from '@seed/tables';
import { systemColumns } from '@seed/tables/system_columns';
import { Column } from './column';
import { ForeignKey } from './foreign_key';
import { Index } from './table_index';

export class Table {
  readonly name: string;
  readonly description: string;
  readonly columns: Column[];
  readonly primaryKeys: readonly string[];
  readonly partitionKey: Partition | null;
  readonly uniqueKeys: readonly (readonly string[])[];
  readonly indices: Index[];
  readonly foreignKeys: ForeignKey[];
  // 実際にレコードを保持する public.* テーブルへ制約を張るため、生の定義を保持する。
  private readonly foreignKeyTemplates: readonly ForeignKeyTemplate[];

  constructor(table: TableTemplate, foreignKeys: ForeignKeyTemplate[]) {
    this.foreignKeyTemplates = foreignKeys ?? [];
    const columns: ColumnTemplate[] = [
      ...table.columns,
      ...systemColumns,
    ] as ColumnTemplate[];

    this.name = table.name;
    this.description = table.description ?? '';
    this.columns = columns.map(
      (c, index) => new Column(c as ColumnTemplate, index === 0),
    );
    this.primaryKeys = table.primaryKeys as string[];
    this.partitionKey = table.partitionKey ?? null;
    this.uniqueKeys = (table.uniqueKeys ??
      []) as readonly (readonly string[])[];
    this.indices = (table.indices ?? []).map(
      (i) => new Index(i as IndexTemplate, table.name),
    );
    this.foreignKeys = (foreignKeys ?? []).map(
      (fk) => new ForeignKey(fk, table.name),
    );
  }

  get ddlText(): string {
    const content = [
      `DROP TABLE IF EXISTS source.${this.name} CASCADE;`,
      `CREATE TABLE source.${this.name} (`,
      this.columns.map((c) => c.ddlText).join('\n'),
      this.primaryKeys.length === 0
        ? undefined
        : `  ,PRIMARY KEY (${this.primaryKeys.join(', ')})`,
      this.uniqueKeys.length === 0
        ? undefined
        : this.uniqueKeys
            .map((keys) => `  ,UNIQUE (${keys.map((k) => k).join(', ')})`)
            .join('\n'),
      this.partitionKey
        ? `) PARTITION BY LIST (${this.partitionKey.columnName});`
        : ');',
      '',
      `CREATE TABLE public.${this.name} () INHERITS (source.${this.name});`,
      `CREATE TABLE garbage.${this.name} () INHERITS (source.${this.name});`,
      // PostgreSQL の継承では PRIMARY KEY / UNIQUE / FOREIGN KEY が子テーブルに
      // 伝播しないため、実データを持つ public / garbage に明示的に主キーを張る。
      this.primaryKeys.length === 0 || this.partitionKey
        ? undefined
        : `\nALTER TABLE public.${this.name} ADD PRIMARY KEY (${this.primaryKeys.join(', ')});`,
      this.primaryKeys.length === 0 || this.partitionKey
        ? undefined
        : `ALTER TABLE garbage.${this.name} ADD PRIMARY KEY (${this.primaryKeys.join(', ')});`,
      this.indices.length === 0 ? undefined : '',
      this.indices.length === 0
        ? undefined
        : this.indices.map((i) => i.createIndexText).join('\n'),
    ];

    return content.filter((line) => line !== undefined).join('\n');
  }

  get foreignKeyConstraints(): string {
    if (this.foreignKeyTemplates.length === 0) {
      return '';
    }

    // 実データを持つ public.* テーブルに対して外部キーを張る。
    // （継承では FK が子テーブルへ伝播しないため source.* に張っても効かない）
    return this.foreignKeyTemplates
      .map((fk) => {
        const columns = fk.columns.join(', ');
        const referencedColumns = fk.referencedColumns.join(', ');
        const name = fk.name ?? `fk_${fk.sourceTable}_${fk.columns.join('_')}`;
        const onDelete = fk.onDelete ?? 'RESTRICT';
        const onUpdate = fk.onUpdate ?? 'RESTRICT';

        return `ALTER TABLE public.${fk.sourceTable} ADD CONSTRAINT ${name} FOREIGN KEY (${columns}) REFERENCES public.${fk.referencedTable} (${referencedColumns}) ON DELETE ${onDelete} ON UPDATE ${onUpdate};`;
      })
      .join('\n');
  }
}
