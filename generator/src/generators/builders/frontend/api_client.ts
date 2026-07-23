import type { Endpoint } from '../../api_endpoints/endpoint';
import type { EndpointGroup } from '../../api_endpoints/endpoint_group';
import { toCamelCase } from '../../util';

export const buildGeneratedApiText = (groups: EndpointGroup[]): string => {
  // 全エンドポイントを収集
  const allEndpoints: Endpoint[] = [];
  for (const group of groups) {
    allEndpoints.push(...group.endpoints);
  }

  // operationIdの重複チェック
  const operationIds = new Set<string>();
  const duplicateIds: string[] = [];
  for (const endpoint of allEndpoints) {
    const camelCaseId = toCamelCase(endpoint.operationId);
    if (operationIds.has(camelCaseId)) {
      duplicateIds.push(camelCaseId);
    } else {
      operationIds.add(camelCaseId);
    }
  }

  if (duplicateIds.length > 0) {
    throw new Error(`Duplicate operationIds found: ${duplicateIds.join(', ')}`);
  }

  // 使用されるスキーマを収集
  const usedSchemas = new Set<string>();
  for (const endpoint of allEndpoints) {
    if (endpoint.requestBody?.schema) {
      usedSchemas.add(endpoint.requestBody.schema);
    }
    if (endpoint.queryParameters?.schema) {
      usedSchemas.add(endpoint.queryParameters.schema);
    }
    for (const response of Object.values(endpoint.responses)) {
      if (response.schema) {
        if (typeof response.schema === 'string') {
          usedSchemas.add(response.schema);
        } else if (
          response.schema.type === 'data' &&
          response.schema.dataSchema
        ) {
          usedSchemas.add(response.schema.dataSchema);
        } else if (
          response.schema.type === 'list' &&
          response.schema.itemSchema
        ) {
          usedSchemas.add(response.schema.itemSchema);
        }
      }
    }
  }

  const schemaImports = Array.from(usedSchemas).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );
  const importStatement =
    schemaImports.length > 0
      ? `import type { ${schemaImports.join(
          ', ',
        )} } from './schemas/generated_schemas';`
      : '';

  // GeneratedApiインターフェースメソッドを生成
  const interfaceMethods = allEndpoints.map((endpoint) => {
    const methodName = toCamelCase(endpoint.operationId);
    const parameters = [];

    if (endpoint.requestBody) {
      parameters.push(`data: ${endpoint.requestBody.schema}`);
    }

    if (endpoint.pathParameters) {
      for (const p of endpoint.pathParameters) {
        const tsType = endpoint.getTypescriptType(p.type, p.format);
        parameters.push(`${p.name}: ${tsType}`);
      }
    }

    if (endpoint.queryParameters) {
      parameters.push(`query: ${endpoint.queryParameters.schema}`);
    }

    const paramList = parameters.join(', ');
    const successResponseType = Object.entries(endpoint.responses).find(
      ([status]) => status.startsWith('2'),
    )?.[1];
    const responseSchema = successResponseType?.schema;

    const { returnType } =
      endpoint.determineResponseTypeFromSchema(responseSchema);

    return `  ${methodName}(${paramList}): ${returnType};`;
  });

  // 実装メソッドを生成
  const implementationMethods = allEndpoints.map((endpoint) => {
    const methodName = toCamelCase(endpoint.operationId);
    const parameters = [];

    if (endpoint.requestBody) {
      parameters.push(`data: ${endpoint.requestBody.schema}`);
    }

    if (endpoint.pathParameters) {
      for (const p of endpoint.pathParameters) {
        const tsType = endpoint.getTypescriptType(p.type, p.format);
        parameters.push(`${p.name}: ${tsType}`);
      }
    }

    if (endpoint.queryParameters) {
      parameters.push(`query: ${endpoint.queryParameters.schema}`);
    }

    const paramList = parameters.join(', ');
    const method = endpoint.method.toLowerCase();
    const pathWithParams = endpoint.fullPath.replace(
      /{(\w+)}/g,
      (_, name) => `\${${name}}`,
    );

    const successResponseType = Object.entries(endpoint.responses).find(
      ([status]) => status.startsWith('2'),
    )?.[1];
    const responseSchema = successResponseType?.schema;

    const { apiMethod, wrapperType } =
      endpoint.determineResponseTypeFromSchema(responseSchema);
    const genericType = wrapperType ? `<${wrapperType}>` : '';

    const requestOptions = [
      `      method: '${method}',`,
      `      url: \`${pathWithParams}\`,`,
      endpoint.requestBody ? '      data,' : '',
      endpoint.queryParameters ? '      params: query,' : '',
    ].filter((line) => line.trim() && line !== '      ,');

    return [
      `  public async ${methodName}(${paramList}) {`,
      `    return await this.${apiMethod}${genericType}({`,
      ...requestOptions,
      '    });',
      '  }',
    ].join('\n');
  });

  // MockApiのメソッド署名を生成
  const mockMethods = allEndpoints.map((endpoint) => {
    const methodName = toCamelCase(endpoint.operationId);
    const parameters = [];

    if (endpoint.requestBody) {
      parameters.push(`data: ${endpoint.requestBody.schema}`);
    }

    if (endpoint.pathParameters) {
      for (const p of endpoint.pathParameters) {
        const tsType = endpoint.getTypescriptType(p.type, p.format);
        parameters.push(`${p.name}: ${tsType}`);
      }
    }

    if (endpoint.queryParameters) {
      parameters.push(`query: ${endpoint.queryParameters.schema}`);
    }

    const paramList = parameters.join(', ');
    const successResponseType = Object.entries(endpoint.responses).find(
      ([status]) => status.startsWith('2'),
    )?.[1];
    const responseSchema = successResponseType?.schema;

    const { returnType } =
      endpoint.determineResponseTypeFromSchema(responseSchema);

    return `  ${methodName}: (${paramList}) => ${returnType};`;
  });

  // MockApiのコンストラクタ初期化を生成
  const mockInitializations = allEndpoints.map((endpoint) => {
    const methodName = toCamelCase(endpoint.operationId);
    return `    this.${methodName} = mock.${methodName} ?? notImplementedResponse;`;
  });

  const content = [
    '// このファイルは generator/src/generators/api_endpoints.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    "import { BaseApi } from './api_base';",
    'import type {',
    '  ApiDataResponse,',
    '  ApiListResponse,',
    '  IdResponse,',
    "} from './api_response';",
    importStatement,
    '',
    'export interface IGeneratedApi {',
    ...interfaceMethods,
    '}',
    '',
    'export class GeneratedApi extends BaseApi implements IGeneratedApi {',
    ...implementationMethods,
    '}',
    '',
    'const notImplementedResponse = async () => {',
    "  throw new Error('実装してください。');",
    '};',
    '',
    'export class GeneratedMockApi extends BaseApi implements IGeneratedApi {',
    ...mockMethods,
    '',
    '  constructor(mock: Partial<IGeneratedApi>) {',
    '    super();',
    '',
    ...mockInitializations,
    '  }',
    '}',
    '',
  ];

  return content.filter((line) => line !== undefined).join('\n');
};
