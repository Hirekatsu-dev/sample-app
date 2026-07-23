import type { Cardinality, ForeignKey, TableColumns, TableName } from './base';

/**
 * 型安全な外部キー定義を作成するヘルパー関数
 *
 * @description 外部キー制約を型安全に定義し、対象テーブルと参照先テーブルの
 * カラム名の自動補完と型チェックを提供します。テーブル定義から切り出された
 * 独立した外部キー定義として使用します。
 *
 * @template TSourceTable - 外部キーを定義するテーブル名の型
 * @template TReferencedTable - 参照先テーブル名の型
 * @param foreignKey - 外部キー定義オブジェクト
 * @param foreignKey.name - 外部キー制約名（省略可）
 * @param foreignKey.sourceTable - 外部キーを定義するテーブル名
 * @param foreignKey.columns - 外部キーを構成するカラム名配列（型安全な補完付き）
 * @param foreignKey.referencedTable - 参照先テーブル名
 * @param foreignKey.referencedColumns - 参照先カラム名配列（型安全な補完付き）
 * @param foreignKey.onDelete - 削除時の動作（デフォルト: "RESTRICT"）
 * @param foreignKey.onUpdate - 更新時の動作（デフォルト: "RESTRICT"）
 * @returns 型安全な外部キー定義
 *
 * @example
 * ```typescript
 * export const tasksTableForeignKeys = defineForeignKey({
 *   name: "fk_tasks_user",
 *   sourceTable: "tasks",
 *   columns: ["user_id"], // tasksテーブルのカラム名で補完される
 *   ...referencesTable("users", ["id"], {
 *     onDelete: "CASCADE",
 *     onUpdate: "RESTRICT",
 *   }),
 * });
 * ```
 */
export function defineForeignKey<
  TSourceTable extends TableName,
  TReferencedTable extends TableName,
>(foreignKey: {
  name?: string;
  sourceTable: TSourceTable;
  columns: readonly TableColumns[TSourceTable][];
  referencedTable: TReferencedTable;
  referencedColumns: readonly TableColumns[TReferencedTable][];
  onDelete?: 'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT' | 'NO ACTION';
  cardinality?: Cardinality;
}): ForeignKey<TSourceTable, TReferencedTable> {
  return foreignKey;
}

/**
 * 参照テーブルとカラムを指定する外部キー設定ヘルパー
 *
 * @description 外部キーの参照先テーブルとカラムを型安全に指定し、
 * 削除・更新時の動作を設定するヘルパー関数です。単一カラムと
 * 複数カラム（複合キー）の両方に対応しています。
 *
 * @template TReferencedTable - 参照先テーブル名の型
 * @param table - 参照先テーブル名
 * @param columns - 参照先カラム名の配列（型安全な自動補完付き）
 * @param options - 外部キー制約のオプション設定
 * @param options.name - 制約名（省略時は自動生成）
 * @param options.onDelete - 削除時の動作（デフォルト: "RESTRICT"）
 * @param options.onUpdate - 更新時の動作（デフォルト: "RESTRICT"）
 * @returns 外部キー定義用のオブジェクト（スプレッド演算子で使用）
 *
 * @example
 * ```typescript
 * // 単一カラム参照
 * ...referencesTable("users", ["id"], {
 *   onDelete: "CASCADE"
 * })
 *
 * // 複合キー参照
 * ...referencesTable("user_sessions", ["user_id", "session_id"])
 * ```
 */
export function referencesTable<TReferencedTable extends TableName>(
  table: TReferencedTable,
  columns: readonly TableColumns[TReferencedTable][],
  options?: {
    name?: string;
    onDelete?:
      | 'CASCADE'
      | 'RESTRICT'
      | 'SET NULL'
      | 'SET DEFAULT'
      | 'NO ACTION';
    onUpdate?:
      | 'CASCADE'
      | 'RESTRICT'
      | 'SET NULL'
      | 'SET DEFAULT'
      | 'NO ACTION';
    /** 参照先から見た関係: 'one-to-one' または 'one-to-many'（デフォルト） */
    relationship?: Cardinality['relationship'];
    /** 参照先が子レコードを0件持つことを許可するか（デフォルト: true） */
    allowZeroChildren?: boolean;
  },
) {
  const cardinality: Cardinality | undefined =
    options?.relationship || options?.allowZeroChildren !== undefined
      ? {
          relationship: options?.relationship ?? 'one-to-many',
          allowZeroChildren: options?.allowZeroChildren,
        }
      : undefined;

  return {
    referencedTable: table,
    referencedColumns: columns,
    onDelete: options?.onDelete ?? 'RESTRICT',
    onUpdate: options?.onUpdate ?? 'RESTRICT',
    ...(options?.name && { name: options.name }),
    ...(cardinality && { cardinality }),
  };
}
