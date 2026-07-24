import { adminApiSchema } from './definitions/admin_api';
import { memberApiSchema } from './definitions/member_api';

// APIスキーマはアプリケーションごとに定義する。
export const apiSchemas = {
  member: memberApiSchema,
  admin: adminApiSchema,
};
