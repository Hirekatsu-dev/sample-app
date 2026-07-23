type ColumnType =
  | 'UUID'
  | 'BIGINT'
  | 'TEXT'
  | 'TIMESTAMPTZ'
  | 'JSONB'
  | 'UUID[]'
  | 'BIGINT[]'
  | 'TEXT[]'
  | 'TIMESTAMPTZ[]'
  | 'JSONB[]';

import type { DomainToPname, domains } from '@seed/domains';
import type { KbnId } from '../kbns';
import type { tables } from '.';
import type { SystemColumnName } from './system_columns';

type DomainType = keyof typeof domains;

type Merge<T> = {
  [K in keyof T]: T[K];
};
type ColumnDefinition = {
  type: ColumnType;
  notNull: boolean;
  default?: string;
};

type FullColumnDefinition = Merge<
  {
    pname: string;
    lname: string;
    description?: string;
  } & ColumnDefinition
>;

export type Domain = Merge<
  {
    pname: string;
    lname: string;
  } & ColumnDefinition
>;

export type Column<
  TPrefix extends string | undefined = string | undefined,
  TDomain extends DomainType = DomainType,
> = Merge<
  {
    domain: TDomain;
    /** 区分値ID（区分ドメインの場合に指定） */
    kbn?: KbnId;
  } & (TPrefix extends string ? { pname: TPrefix } : { pname?: string }) &
    Partial<Omit<FullColumnDefinition, 'pname'>>
>;

// カラム定義から実際のカラム名を抽出する型
export type ExtractColumnName<T> = T extends {
  domain: infer TDomain;
  pname?: infer TPrefix;
}
  ? TDomain extends keyof DomainToPname
    ? TPrefix extends string
      ? `${TPrefix}_${DomainToPname[TDomain]}`
      : DomainToPname[TDomain]
    : never
  : never;

// テーブルのカラム配列から全カラム名のUnion型を作成（システムカラムを含む）
type ExtractAllColumnNames<T extends readonly Column[]> = T extends readonly [
  infer Head,
  ...infer Tail extends readonly Column[],
]
  ? ExtractColumnName<Head> | ExtractAllColumnNames<Tail>
  : never;

// ユーザー定義カラム + システムカラムを結合
type AllColumnNames<T extends readonly Column[]> =
  | ExtractAllColumnNames<T>
  | SystemColumnName;

export type Index<TColumnNames extends string = string> = {
  name?: string;
  columns: readonly TColumnNames[];
  unique?: boolean;
  type?: 'btree' | 'hash' | 'gin' | 'gist';
};

export type TableName = (typeof tables)[number]['name'];

// テーブル配列から各テーブルのカラム名を動的に抽出
type ExtractTableColumns<T extends readonly Table[]> = {
  [K in T[number] as K['name']]: AllColumnNames<K['columns']>;
};

export type TableColumns = ExtractTableColumns<typeof tables>;

/**
 * カーディナリティの定義
 * - relationship: 参照先から見た関係の種類
 *   - 'one-to-one': 1対1（参照先1レコードに対してソース側も1レコード）
 *   - 'one-to-many': 1対多（参照先1レコードに対してソース側は複数レコード）
 * - allowZeroChildren: 参照先が子レコードを0件持つことを許可するか
 *   - true: 0..n または 0..1（デフォルト）
 *   - false: 1..n または 1（少なくとも1件の子が必要）
 *
 * 注: FK側がNULL許可かどうかは、カラム定義の notNull から自動判断されます
 */
export type Cardinality = {
  relationship: 'one-to-one' | 'one-to-many';
  allowZeroChildren?: boolean;
};

export type ForeignKey<
  TSourceTable extends TableName = TableName,
  TReferencedTable extends TableName = TableName,
> = {
  name?: string;
  sourceTable: TSourceTable;
  columns: readonly TableColumns[TSourceTable][];
  referencedTable: TReferencedTable;
  referencedColumns: readonly TableColumns[TReferencedTable][];
  onDelete?: 'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT' | 'NO ACTION';
  cardinality?: Cardinality;
};

export type Partition<TColumnName extends string = string> = {
  columnName: TColumnName;
  sourceTableName: string;
};

export type Table<
  TColumns extends readonly Column<
    string | undefined,
    DomainType
  >[] = readonly Column<string | undefined, DomainType>[],
  TName extends string = string,
> = {
  name: TName;
  description?: string;
  columns: TColumns;
  primaryKeys: readonly AllColumnNames<TColumns>[];
  partitionKey?: Partition<AllColumnNames<TColumns>>;
  uniqueKeys?: readonly (readonly AllColumnNames<TColumns>[])[];
  indices?: readonly Index<AllColumnNames<TColumns>>[];
};

export function defineTable<
  TColumns extends readonly Column<string | undefined, DomainType>[],
  TName extends string,
>(table: Table<TColumns, TName>): Table<TColumns, TName> {
  return table;
}
