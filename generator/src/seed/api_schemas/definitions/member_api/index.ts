import type { ApiSchema } from '../../types';

// APIスキーマ定義は同階層に追加し、ここに登録する。
// 例: export const memberApiSchema = { auth: authSchemas, users: userSchemas } as const;
export const memberApiSchema: Record<string, readonly ApiSchema[]> = {};
