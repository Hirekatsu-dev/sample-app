export const buildOpenApiIndexText = (
  paths: Array<{ fullPath: string; pathFilePath: string }>,
): string => {
  const pathRefs: string[] = [];
  for (const { fullPath, pathFilePath } of paths) {
    pathRefs.push(
      `  ${fullPath}:`,
      `    $ref: "./paths/generated/${pathFilePath}.yaml"`,
    );
  }

  const content = [
    '# このファイルは generator/src/generators/api_endpoints.ts から生成されます。',
    '# 直接編集しないでください。',
    '',
    'openapi: 3.0.3',
    'info:',
    '  title: API',
    '  version: 1.0.0',
    '  description: API',
    '',
    'servers:',
    '  - url: http://localhost:3000',
    '    description: 開発環境',
    '',
    'paths:',
    ...pathRefs,
    '',
    'components:',
    '  schemas:',
    '    $ref: "./schemas/generated_schemas.yaml"',
    '  securitySchemes:',
    '    BearerAuth:',
    '      type: http',
    '      scheme: bearer',
    '      bearerFormat: JWT',
    '',
  ];

  return content.join('\n');
};
