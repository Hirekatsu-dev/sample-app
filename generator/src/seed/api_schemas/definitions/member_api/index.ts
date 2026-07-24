import { authSchemas } from './auth';
import { userSchemas } from './user';

// APIスキーマ定義は同階層に追加し、ここに登録する。
export const memberApiSchema = {
  auth: authSchemas,
  users: userSchemas,
} as const;
