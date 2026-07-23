import { memberApiEndpoints } from '../seed/api_endpoints';
import { apiSchemas } from '../seed/api_schemas';
import {
  collectEndpointGroups,
  Endpoint,
  EndpointGroup,
} from './api_endpoints/';
import {
  buildHandlerStubContent,
  buildModContent,
  buildRustHandlerText,
} from './builders/backend/handler';
import { buildRustRouteText } from './builders/backend/router';
import { buildOpenApiIndexText } from './builders/docs/open_api/index';
import {
  buildOpenApiPathItemText,
  type OpenApiQueryParam,
} from './builders/docs/open_api/path';
import { buildGeneratedApiText } from './builders/frontend/api_client';
import { clear, render, renderIfNotExists, toSnakeCase } from './util';

/*
# APIエンドポイントに関するコードを生成する
## 生成物一覧
- apps/api/src/route/generated/{group}.rs
  - Rustのルート定義
- apps/frontend/src/api/generated_api.ts
  - TypeScript APIクライアント
- docs/open_api/api/paths/generated/{group}.yaml
  - OpenAPIのパス定義
- docs/open_api/api/index.open_api.yaml
  - OpenAPI統合ファイル
*/

// フルパス（例: /api/v1/problems/{problemId}/rating）からファイルパスを生成する
const generateFilePathFromFullPath = (fullPath: string): string => {
  let filePath = fullPath.replace(/^\/api/, '').replace(/^\//, '');
  filePath = filePath
    .split('/')
    .map((part) => {
      if (/^v\d+$/.test(part)) return part;
      const withoutBraces = part.replace(/\{(\w+)\}/g, '$1');
      return toSnakeCase(withoutBraces);
    })
    .join('/');
  return filePath;
};

// パスからファイルパスを生成するヘルパー関数
const generateFilePath = (basePath: string, groupName?: string): string => {
  let filePath = basePath.replace(/^\/api/, '').replace(/^\//, '');
  // パスパラメータの{param}を適切な形式に変換
  filePath = filePath.replace(/\{(\w+)\}/g, '$1');
  // ファイル名をスネークケースに変換（ただし、v1のような形式は保持）
  filePath = filePath
    .split('/')
    .map((part) => {
      // v1, v2などのバージョン形式は変換しない
      if (/^v\d+$/.test(part)) {
        return part;
      }
      return toSnakeCase(part);
    })
    .join('/');
  // グループ名が指定されている場合はファイル名に追加（ユニーク性を確保）
  if (groupName) {
    filePath = `${filePath}/${toSnakeCase(groupName)}`;
  }
  return filePath;
};

const reset = () => {
  clear('apps/api/src/handler/generated');
  clear('apps/api/src/handler/generated.rs');
  clear('apps/api/src/route/generated');
  clear('apps/api/src/route/generated.rs');
  clear('apps/frontend/src/api/generated_api.ts');
  clear('docs/open_api/api/paths/generated');
};

const generateRustHandlerText = (group: EndpointGroup, basePath: string) => {
  const path = basePath.endsWith('/') ? basePath : `${basePath}/`;
  render(buildRustHandlerText(group), `${path}${group.name}.rs`);

  for (const subGroup of Object.values(group.subEndpoints)) {
    generateRustHandlerText(subGroup, `${path}${group.name}`);
  }
};

const generateRustRouterText = (group: EndpointGroup, basePath: string) => {
  const path = basePath.endsWith('/') ? basePath : `${basePath}/`;
  render(buildRustRouteText(group), `${path}${group.name}.rs`);

  for (const subGroup of Object.values(group.subEndpoints)) {
    generateRustRouterText(subGroup, `${path}${group.name}`);
  }
};

const generateHandlerStubs = (group: EndpointGroup, basePath: string) => {
  const path = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const hasSubGroups = group.subEndpoints.length > 0;

  if (group.endpoints.length > 0) {
    // サブグループがある場合は {name}/mod.rs に統一（Rustのモジュール曖昧性を回避）
    const handlerFilePath = hasSubGroups
      ? path
        ? `apps/api/src/handler/handlers${path}/${group.name}/mod.rs`
        : `apps/api/src/handler/handlers/${group.name}/mod.rs`
      : path
        ? `apps/api/src/handler/handlers${path}/${group.name}.rs`
        : `apps/api/src/handler/handlers/${group.name}.rs`;

    const subModuleNames = group.subEndpoints.map((sub) => sub.name);
    const stubContent = buildHandlerStubContent(group, subModuleNames);
    renderIfNotExists(stubContent, handlerFilePath);

    // mod.rsファイルの生成（ディレクトリがある場合のみ）
    if (path) {
      const modFilePath = `apps/api/src/handler/handlers${path}/mod.rs`;
      const modContent = buildModContent(group, path);
      renderIfNotExists(modContent, modFilePath);
    }
  }

  // サブグループのスタブも生成
  for (const subGroup of Object.values(group.subEndpoints)) {
    const newPath = path ? `${path}/${group.name}` : `/${group.name}`;
    generateHandlerStubs(subGroup, newPath);
  }
};

export const generateApiEndpoints = () => {
  reset();

  // member_apiのエンドポイントを再帰的に取得
  const memberEndpointGroups = collectEndpointGroups(memberApiEndpoints);

  generateRustHandlerText(
    new EndpointGroup(memberApiEndpoints),
    'apps/api/src/handler/',
  );
  generateRustRouterText(
    new EndpointGroup(memberApiEndpoints),
    'apps/api/src/route/',
  );

  // ハンドラーのスタブファイルを生成
  // トップレベルの `generated` グループをスキップし、サブグループから開始する
  // （ディスパッチ層が `crate::handler::handlers::auth::...` 等を呼ぶため）
  const topGroup = new EndpointGroup(memberApiEndpoints);
  for (const subGroup of topGroup.subEndpoints) {
    generateHandlerStubs(subGroup, '');
  }

  // TypeScript APIクライアントの生成
  const generatedApiText = buildGeneratedApiText(
    Object.values(memberEndpointGroups).map((group) => {
      return new EndpointGroup(group, generateFilePath(group.basePath));
    }),
  );
  render(generatedApiText, 'apps/frontend/src/api/generated_api.ts');

  // クエリパラメータ用のスキーママップを構築
  const querySchemaMap = new Map<string, readonly OpenApiQueryParam[]>();
  for (const categorySchemas of Object.values(apiSchemas.member)) {
    for (const schema of categorySchemas) {
      querySchemaMap.set(
        schema.name,
        schema.properties.map((prop) => ({
          name: prop.name,
          type: prop.type,
          format: 'format' in prop ? (prop.format as string) : undefined,
          description:
            'description' in prop ? (prop.description as string) : undefined,
          required: 'required' in prop ? (prop.required as boolean) : undefined,
          example: 'example' in prop ? prop.example : undefined,
        })),
      );
    }
  }

  // OpenAPIパス定義の生成（パスごとに1ファイル）
  const allEndpointInstances = Object.values(memberEndpointGroups).flatMap(
    (group) =>
      (group.endpoints ?? []).map(
        (e) => new Endpoint(e, group.name, group.basePath),
      ),
  );

  const endpointsByPath = new Map<string, Endpoint[]>();
  for (const endpoint of allEndpointInstances) {
    const path = endpoint.fullPath;
    if (!endpointsByPath.has(path)) {
      endpointsByPath.set(path, []);
    }
    endpointsByPath.get(path)?.push(endpoint);
  }

  const pathInfos: { fullPath: string; pathFilePath: string }[] = [];
  for (const [fullPath, endpoints] of endpointsByPath.entries()) {
    const pathFilePath = generateFilePathFromFullPath(fullPath);
    render(
      buildOpenApiPathItemText(endpoints, pathFilePath, querySchemaMap),
      `docs/open_api/api/paths/generated/${pathFilePath}.yaml`,
    );
    pathInfos.push({ fullPath, pathFilePath });
  }

  // OpenAPI統合ファイルの生成
  const openApiIndexContent = buildOpenApiIndexText(pathInfos);
  render(openApiIndexContent, 'docs/open_api/api/index.open_api.yaml');
};
