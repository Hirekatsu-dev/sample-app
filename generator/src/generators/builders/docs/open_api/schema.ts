import type { Schema } from '../../../api_schemas/schema';

export const buildOpenApiSchemasText = (schemas: Schema[]) => {
  const yamlSchemas = schemas
    .map((schema) => schema.openApiSchemaText)
    .join('\n');

  const content = [
    '# このファイルは generator/src/generators/api_schemas.ts から生成されます。',
    '# 直接編集しないでください。',
    '',
    yamlSchemas,
    '',
  ];

  return content.join('\n');
};

export const buildSchemasSummaryText = (
  memberSchemas: Record<string, readonly { name: string }[]>,
): string => {
  const content = [
    '# このファイルは generator/src/generators/api_schemas.ts から生成されます。',
    '# 直接編集しないでください。',
    '',
  ];

  for (const [groupName, schemas] of Object.entries(memberSchemas)) {
    for (const schema of schemas) {
      content.push(
        `${schema.name}:`,
        `  $ref: "./generated/${groupName}.yaml#/${schema.name}"`,
      );
    }
  }

  content.push('');
  return content.join('\n');
};
