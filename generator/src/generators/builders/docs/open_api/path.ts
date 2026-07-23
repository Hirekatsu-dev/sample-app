import type { Endpoint } from '../../../api_endpoints/endpoint';
import type { EndpointGroup } from '../../../api_endpoints/endpoint_group';

// OpenAPI生成時にクエリパラメータのスキーマプロパティを渡すための型
export type OpenApiQueryParam = {
  name: string;
  type: string;
  format?: string;
  description?: string;
  required?: boolean;
  example?: unknown;
};

/** エラー一覧をmarkdownテーブル形式のdescription文字列に変換する */
const buildErrorDescription = (
  errs: Array<{
    name: string;
    errorCode: string;
    description?: string;
    dataSchema?: string;
  }>,
): string => {
  const rows = errs.map((err) => {
    const desc = err.description ?? err.name;
    const data = err.dataSchema ?? '-';
    return `| ${err.errorCode} | ${desc} | ${data} |`;
  });
  return [
    '| エラーコード | 説明 | 追加データ |',
    '| --- | --- | --- |',
    ...rows,
  ].join('\\n');
};

export const buildOpenApiEndpointPathText = (
  endpoint: Endpoint,
  schemaRefPath: string,
  querySchemaMap?: Map<string, readonly OpenApiQueryParam[]>,
): string => {
  const method = endpoint.method.toLowerCase();

  const responses = Object.entries(endpoint.responses).map(
    ([status, response]) => {
      const getSchemaContent = () => {
        if (response.errors) {
          return [
            '        content:',
            '          application/json:',
            '            schema:',
            '              type: object',
            '              required:',
            '                - error_code',
            '              properties:',
            '                error_code:',
            '                  type: string',
            '                data:',
            '                  type: object',
            '                  nullable: true',
          ];
        }
        if (!response.schema || typeof response.schema !== 'object') return [];

        switch (response.schema.type) {
          case 'id':
            return [
              '        content:',
              '          application/json:',
              '            schema:',
              '              type: string',
              '              format: uuid',
            ];
          case 'data':
            return [
              '        content:',
              '          application/json:',
              '            schema:',
              `              $ref: "${schemaRefPath}#/${response.schema.dataSchema}"`,
            ];
          case 'list':
            return [
              '        content:',
              '          application/json:',
              '            schema:',
              '              type: array',
              '              items:',
              `                $ref: "${schemaRefPath}#/${response.schema.itemSchema}"`,
            ];
          default:
            return [];
        }
      };

      const description = response.errors
        ? buildErrorDescription(response.errors)
        : response.description;

      const content = [
        `      "${status}":`,
        `        description: "${description}"`,
        ...getSchemaContent(),
      ];

      return content.join('\n');
    },
  );

  // パスパラメータとクエリパラメータの生成
  const parameterEntries: string[] = [];

  if (endpoint.pathParameters && endpoint.pathParameters.length > 0) {
    for (const param of endpoint.pathParameters) {
      const lines = [
        '      - in: path',
        `        name: ${param.name}`,
        '        required: true',
        '        schema:',
        `          type: ${param.type}`,
      ];
      if (param.format) {
        lines.push(`          format: ${param.format}`);
      }
      if (param.description) {
        lines.push(`        description: "${param.description}"`);
      }
      if (param.example !== undefined) {
        lines.push(`        example: ${JSON.stringify(param.example)}`);
      }
      parameterEntries.push(lines.join('\n'));
    }
  }

  if (endpoint.queryParameters && querySchemaMap) {
    const schemaProperties = querySchemaMap.get(
      endpoint.queryParameters.schema,
    );
    if (schemaProperties) {
      for (const prop of schemaProperties) {
        const lines = ['      - in: query', `        name: ${prop.name}`];
        if (prop.required) {
          lines.push('        required: true');
        }
        lines.push('        schema:');
        lines.push(`          type: ${prop.type}`);
        if (prop.format) {
          lines.push(`          format: ${prop.format}`);
        }
        if (prop.description) {
          lines.push(`        description: "${prop.description}"`);
        }
        if (prop.example !== undefined) {
          lines.push(`        example: ${JSON.stringify(prop.example)}`);
        }
        parameterEntries.push(lines.join('\n'));
      }
    }
  }

  const parametersContent =
    parameterEntries.length > 0 ? ['    parameters:', ...parameterEntries] : [];

  const requestBodyContent = endpoint.requestBody
    ? [
        '    requestBody:',
        `      required: ${endpoint.requestBody.required}`,
        '      content:',
        '        application/json:',
        '          schema:',
        `            $ref: "${schemaRefPath}#/${endpoint.requestBody.schema}"`,
      ]
    : [];

  const securityContent = (() => {
    if (!endpoint.security) return [];
    if (endpoint.security.includes('OptionalBearerAuth')) {
      return ['    security:', '      - {}', '      - BearerAuth: []'];
    }
    return [
      '    security:',
      ...endpoint.security.map((sec) => `      - ${sec}: []`),
    ];
  })();

  const content = [
    `  ${method}:`,
    `    operationId: ${endpoint.operationId}`,
    `    summary: "${endpoint.summary}"`,
    endpoint.description
      ? `    description: "${endpoint.description}"`
      : undefined,
    endpoint.tags
      ? `    tags: [${endpoint.tags.map((t) => `"${t}"`).join(', ')}]`
      : undefined,
    ...parametersContent,
    ...requestBodyContent,
    ...securityContent,
    '    responses:',
    ...responses,
  ];

  return content.filter((line) => line !== undefined).join('\n');
};

export const buildOpenApiPathItemText = (
  endpoints: Endpoint[],
  filePath: string,
  querySchemaMap?: Map<string, readonly OpenApiQueryParam[]>,
): string => {
  const depth = filePath.split('/').length;
  const schemaRefPath = `${'../'.repeat(depth)}../schemas/generated_schemas.yaml`;

  // buildOpenApiEndpointPathText は2スペースインデントでメソッドを生成するため、
  // Path Item Object ファイルではルートレベルになるよう2スペース除去する
  const methods = endpoints
    .map((endpoint) => {
      const text = buildOpenApiEndpointPathText(
        endpoint,
        schemaRefPath,
        querySchemaMap,
      );
      return text
        .split('\n')
        .map((line) => line.replace(/^ {2}/, ''))
        .join('\n');
    })
    .join('\n');

  const content = [
    '# このファイルは generator/src/generators/api_endpoints.ts から生成されます。',
    '# 直接編集しないでください。',
    '',
    methods,
    '',
  ];

  return content.join('\n');
};

export const buildOpenApiGroupPathText = (
  group: EndpointGroup,
  filePath: string,
  querySchemaMap?: Map<string, readonly OpenApiQueryParam[]>,
): string => {
  // ファイルの階層レベルに応じてスキーマへの相対パスを計算
  const depth = filePath.split('/').length;
  const schemaRefPath = `${'../'.repeat(depth)}../schemas/generated_schemas.yaml`;

  // パスごとにエンドポイントをグループ化
  const pathGroups = new Map<string, Endpoint[]>();
  for (const endpoint of group.endpoints) {
    const path = endpoint.fullPath;
    if (!pathGroups.has(path)) {
      pathGroups.set(path, []);
    }
    pathGroups.get(path)?.push(endpoint);
  }

  // パスごとにメソッドをまとめて出力
  const paths = Array.from(pathGroups.entries())
    .map(([path, endpoints]) => {
      const methods = endpoints
        .map((e) =>
          buildOpenApiEndpointPathText(e, schemaRefPath, querySchemaMap),
        )
        .join('\n');
      return `${path}:\n${methods}`;
    })
    .join('\n\n');

  const content = [
    '# このファイルは generator/src/generators/api_endpoints.ts から生成されます。',
    '# 直接編集しないでください。',
    '',
    paths,
    '',
  ];

  return content.join('\n');
};
