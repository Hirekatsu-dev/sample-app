import type {
  Cardinality,
  ForeignKey as ForeignKeyTemplate,
} from '@seed/tables';

export class ForeignKey {
  readonly name: string;
  readonly tableName: string;
  readonly columns: readonly string[];
  readonly referencedTable: string;
  readonly referencedColumns: readonly string[];
  readonly onDelete: string;
  readonly onUpdate: string;
  readonly cardinality: Cardinality;

  constructor(foreignKey: ForeignKeyTemplate, tableName: string) {
    this.name =
      foreignKey.name ?? `fk_${tableName}_${foreignKey.columns.join('_')}`;
    this.tableName = tableName;
    this.columns = foreignKey.columns;
    this.referencedTable = foreignKey.referencedTable;
    this.referencedColumns = foreignKey.referencedColumns;
    this.onDelete = foreignKey.onDelete ?? 'RESTRICT';
    this.onUpdate = foreignKey.onUpdate ?? 'RESTRICT';
    this.cardinality = foreignKey.cardinality ?? {
      relationship: 'one-to-many',
    };
  }

  get constraintText(): string {
    return [
      `CONSTRAINT ${this.name}`,
      `FOREIGN KEY (${this.columns.join(', ')})`,
      `REFERENCES source.${this.referencedTable} (${this.referencedColumns.join(', ')})`,
      `ON DELETE ${this.onDelete}`,
      `ON UPDATE ${this.onUpdate}`,
    ].join(' ');
  }

  get alterTableText(): string {
    return `ALTER TABLE source.${this.tableName} ADD ${this.constraintText};`;
  }
}
