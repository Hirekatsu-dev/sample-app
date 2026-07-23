import { domains } from '@seed/domains';
import type { KbnId } from '@seed/kbns';
import { kbns } from '@seed/kbns';
import type { Column as ColumnTemplate } from '@seed/tables';

export class Column {
  readonly lname: string;
  readonly pname: string;
  readonly type: string;
  readonly notNull: boolean;
  readonly default: string;
  readonly description: string;
  readonly isFirstColumn: boolean;
  readonly kbn: KbnId | undefined;
  readonly kbnName: string | undefined;

  constructor(column: ColumnTemplate, isFirstColumn = false) {
    const domain = domains[column.domain as keyof typeof domains];

    this.lname = column.lname
      ? `${column.lname}_${domain.lname}`
      : domain.lname;

    this.pname = column.pname
      ? `${column.pname}_${domain.pname}`
      : domain.pname;

    this.type = (column as { type?: string }).type ?? domain.type;
    this.notNull = column.notNull ?? domain.notNull;
    this.default =
      (column as { default?: string }).default ?? domain.default ?? '';
    this.description = (column as { description?: string }).description ?? '';
    this.isFirstColumn = isFirstColumn;

    this.kbn = 'kbn' in column ? (column.kbn as KbnId | undefined) : undefined;
    if (this.kbn) {
      const kbnDef = kbns.find((k) => k.id === this.kbn);
      this.kbnName = kbnDef?.name;
    }
  }

  get ddlText(): string {
    let comment = this.lname;
    if (this.kbnName) {
      comment += ` [${this.kbnName}]`;
    }

    let content = `${this.pname} ${this.type}${
      this.notNull ? ' NOT NULL' : ''
    }${this.default ? ` DEFAULT ${this.default}` : ''}\t -- ${comment}`;

    if (!this.isFirstColumn) {
      content = `,${content}`;
    }

    return `  ${content}`;
  }
}
