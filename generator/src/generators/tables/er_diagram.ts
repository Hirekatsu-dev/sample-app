import type { Cardinality } from '@seed/tables';
import type { Table } from './table';

export class ERDiagram {
  readonly tables: Table[];

  constructor(tables: Table[]) {
    this.tables = tables;
  }

  private extractRelationships(): Array<{
    from: string;
    to: string;
    fromColumn: string;
    toColumn: string;
    cardinality: Cardinality;
    fkNullable: boolean;
  }> {
    const relationships: Array<{
      from: string;
      to: string;
      fromColumn: string;
      toColumn: string;
      cardinality: Cardinality;
      fkNullable: boolean;
    }> = [];

    for (const table of this.tables) {
      for (const foreignKey of table.foreignKeys) {
        const fkColumn = table.columns.find((col) =>
          foreignKey.columns.includes(col.pname),
        );
        const fkNullable = fkColumn ? !fkColumn.notNull : false;

        relationships.push({
          from: foreignKey.referencedTable,
          to: table.name,
          fromColumn: foreignKey.referencedColumns.join(', '),
          toColumn: foreignKey.columns.join(', '),
          cardinality: foreignKey.cardinality,
          fkNullable,
        });
      }
    }

    // 外部キーが定義されていない場合の推測検出（_id パターン）
    for (const table of this.tables) {
      for (const column of table.columns) {
        const alreadyDefined = table.foreignKeys.some((fk) =>
          fk.columns.includes(column.pname),
        );
        if (alreadyDefined) continue;

        if (column.pname.endsWith('_id') && column.pname !== 'id') {
          const referencedTableName = column.pname.replace('_id', '');
          const referencedTable = this.tables.find(
            (t) =>
              t.name === referencedTableName ||
              t.name === `${referencedTableName}s`,
          );

          if (referencedTable) {
            relationships.push({
              from: referencedTable.name,
              to: table.name,
              fromColumn: 'id',
              toColumn: column.pname,
              cardinality: {
                relationship: 'one-to-many',
              },
              fkNullable: !column.notNull,
            });
          }
        }
      }
    }

    return relationships;
  }

  get mermaidText(): string {
    const relationships = this.extractRelationships();

    const content = [
      'erDiagram',
      '',
      ...this.tables.map((table) => {
        const columns = table.columns
          .filter(
            (col) =>
              !col.pname.startsWith('created_') &&
              !col.pname.startsWith('updated_') &&
              !col.pname.startsWith('deleted_') &&
              col.pname !== 'meta_json',
          )
          .map((col) => {
            const type = this.getMermaidType(col.type);
            const nullable = col.notNull ? '' : ' "nullable"';
            const pk = col.pname === 'id' ? ' PK' : '';
            return `    ${type} ${col.pname}${pk}${nullable}`;
          });

        return [`  ${table.name.toUpperCase()} {`, ...columns, '  }'].join(
          '\n',
        );
      }),
      '',
      ...relationships.map((rel) => {
        const notation = this.getCardinalityNotation(
          rel.cardinality,
          rel.fkNullable,
        );
        return `  ${rel.from.toUpperCase()} ${notation} ${rel.to.toUpperCase()} : "${rel.fromColumn} -> ${rel.toColumn}"`;
      }),
    ];

    return content.join('\n');
  }

  private getCardinalityNotation(
    cardinality: Cardinality,
    fkNullable: boolean,
  ): string {
    const leftSide = fkNullable ? '|o' : '||';
    const allowZeroChildren = cardinality.allowZeroChildren ?? true;

    let rightSide: string;
    if (cardinality.relationship === 'one-to-one') {
      rightSide = allowZeroChildren ? 'o|' : '||';
    } else {
      rightSide = allowZeroChildren ? 'o{' : '|{';
    }

    return `${leftSide}--${rightSide}`;
  }

  private getMermaidType(sqlType: string): string {
    switch (sqlType) {
      case 'UUID':
        return 'uuid';
      case 'TEXT':
        return 'string';
      case 'BIGINT':
        return 'bigint';
      case 'TIMESTAMPTZ':
        return 'timestamp';
      case 'JSONB':
        return 'json';
      case 'UUID[]':
        return 'uuid-array';
      case 'TEXT[]':
        return 'string-array';
      case 'BIGINT[]':
        return 'bigint-array';
      case 'TIMESTAMPTZ[]':
        return 'timestamp-array';
      case 'JSONB[]':
        return 'json-array';
      default:
        return sqlType.toLowerCase();
    }
  }
}
