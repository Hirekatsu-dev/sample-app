import type { Index as IndexTemplate } from '@seed/tables';

export class Index {
  readonly name: string;
  readonly tableName: string;
  readonly columns: readonly string[];
  readonly unique: boolean;
  readonly type: 'btree' | 'hash' | 'gin' | 'gist';

  constructor(index: IndexTemplate, tableName: string) {
    this.name =
      index.name ??
      `idx_${tableName}_${index.columns.map((c) => c.toLowerCase()).join('_')}`;
    this.tableName = tableName;
    this.columns = index.columns;
    this.unique = index.unique ?? false;
    this.type = index.type ?? 'btree';
  }

  get createIndexText(): string {
    return `CREATE ${this.unique ? 'UNIQUE ' : ''}INDEX ${
      this.name
    } ON public.${
      this.tableName
    } USING ${this.type.toUpperCase()} (${this.columns.join(', ')});`;
  }
}
