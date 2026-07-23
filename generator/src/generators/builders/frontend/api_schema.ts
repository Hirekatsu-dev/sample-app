import type { Schema } from '../../api_schemas/schema';
import { toSnakeCase } from '../../util';

export const buildTypescriptSchemasText = (schemas: Schema[]) => {
  const interfaces = schemas
    .map((schema) => schema.typescriptInterfaceText)
    .join('\n\n');

  const content = [
    '// このファイルは generator/src/generators/api_schemas.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    '// biome-ignore lint/correctness/noUnusedImports: 自動生成コードのため使用しないこともある',
    'import type { KbnType } from "@/kbn";',
    '',
    interfaces,
    '',
  ];

  return content.join('\n');
};

export const buildSchemasReExportText = (
  schemaGroups: Record<string, Schema[]>,
): string => {
  const reExports = Object.entries(schemaGroups)
    .map(([category, _schemas]) => {
      return `export * from "./generated/${toSnakeCase(category)}";`;
    })
    .sort();

  const content = [
    '// このファイルは generator/src/generators/api_schemas.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    '// re-export all schemas',
    '',
    // スキーマが1つも無いときも有効なモジュールにするため空 export を出す
    ...(reExports.length > 0 ? reExports : ['export {};']),
    '',
  ];

  return content.join('\n');
};
