import type { Table } from './base';
import {
  userSessionsTable,
  userSessionsTableForeignKeys,
} from './definitions/user_sessions';
import { usersTable, usersTableForeignKeys } from './definitions/users';

// Re-export types and helpers
export * from './base';

// Export all table definitions
export const tables = [
  usersTable,
  userSessionsTable,
] as const satisfies readonly Table[];

// Export foreign key definitions separately
export const foreignKeys = [
  ...usersTableForeignKeys,
  ...userSessionsTableForeignKeys,
] as const;
