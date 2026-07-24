import type { ApiEndpointGroup } from '../../types';

// 管理API（apps/admin_api）のエンドポイント定義。
// エンドポイントグループは同階層に追加し、subEndpointGroups に登録する。
export const adminApiEndpoints = {
  name: 'generated',
  basePath: '/api',
  subEndpointGroups: {},
} as const satisfies ApiEndpointGroup;
