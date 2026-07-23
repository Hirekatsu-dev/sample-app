import type { EndpointGroup } from '../../api_endpoints/endpoint_group';
import { toSnakeCase } from '../../util';

export const buildRustRouteText = (group: EndpointGroup): string => {
  // パスごとにエンドポイントをグループ化してルートを生成
  const pathGroups = new Map<
    string,
    { method: string; operationId: string }[]
  >();
  for (const endpoint of group.endpoints) {
    const path = endpoint.path; // basePathを除いた相対パス
    if (!pathGroups.has(path)) {
      pathGroups.set(path, []);
    }
    pathGroups.get(path)?.push(endpoint);
  }

  // パスごとにメソッドチェーンを生成
  const routes = Array.from(pathGroups.entries())
    .map(([path, endpoints]) => {
      const methods = endpoints
        .map((e) => {
          const method = e.method.toLowerCase();
          const methodName = toSnakeCase(e.operationId);
          return `${method}(handler::${methodName})`;
        })
        .join('.');
      // パスパラメータをAxum形式に変換（例: /{mediaId} -> /:media_id）
      const routePath =
        path === ''
          ? '/'
          : path.replace(
              /\{([^}]+)\}/g,
              (_, paramName) => `:${toSnakeCase(paramName)}`,
            );
      return `.route("${routePath}", ${methods})`;
    })
    .join('\n\t\t');

  // サブルーターのネスト処理を生成
  const subRoutes = group.subEndpoints.map((subEndpoint) => {
    return `\t\t.merge(${subEndpoint.name}::${subEndpoint.name}_routes())`;
  });

  const content = [
    '// このファイルは generator/src/generators/api_endpoints.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    group.endpoints.length > 0
      ? `use crate::handler::generated${group.filePath?.replace(/\//g, '::') || toSnakeCase(group.name)} as handler;`
      : undefined,
    '#[allow(unused_imports)]',
    'use axum::{routing::*, Router};',
    'use crate::state::AppState;',
    '',
    ...group.subEndpoints.map(
      (subEndpoints) => `pub mod ${subEndpoints.name};`,
    ),
    group.subEndpoints.length === 0 ? undefined : '',
    `pub fn ${group.name}_routes() -> Router<AppState> {`,
    '\tlet router = Router::new()',
    routes ? `\t\t${routes}` : undefined,
    ...subRoutes,
    '\t;',
    '',
    `\tRouter::new().nest("${group.basePath.replace(/\{([^}]+)\}/g, (_, paramName) => `:${toSnakeCase(paramName)}`)}", router)`,
    '}',
    '',
  ];

  return content.filter((row) => row !== undefined).join('\n');
};
