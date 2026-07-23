import type { ForeignKey, Table } from './base';

// Re-export types and helpers
export * from './base';

// Export all table definitions
// 定義を追加する際は `as const satisfies readonly Table[]` を付けて
// テーブル名のリテラル型を保持する。
export const tables: readonly Table[] = [];

// Export foreign key definitions separately
export const foreignKeys: readonly ForeignKey[] = [];
