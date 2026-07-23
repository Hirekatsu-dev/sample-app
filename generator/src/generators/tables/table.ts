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

  constructor(table: TableTemplate, foreignKeys: ForeignKeyTemplate[]) {
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
      this.indices.length === 0 ? undefined : '',
      this.indices.length === 0
        ? undefined
        : this.indices.map((i) => i.createIndexText).join('\n'),
    ];

    return content.filter((line) => line !== undefined).join('\n');
  }

  get foreignKeyConstraints(): string {
    if (this.foreignKeys.length === 0) {
      return '';
    }

    return this.foreignKeys.map((fk) => fk.alterTableText).join('\n');
  }
}
