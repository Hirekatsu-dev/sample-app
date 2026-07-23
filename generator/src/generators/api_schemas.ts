import { apiSchemas } from '../seed/api_schemas';
import { Schema } from './api_schemas/schema';
import {
  buildRustModText,
  buildRustSchemasText,
} from './builders/backend/schema';
import {
  buildOpenApiSchemasText,
  buildSchemasSummaryText,
} from './builders/docs/open_api/schema';
import {
  buildSchemasReExportText,
  buildTypescriptSchemasText,
} from './builders/frontend/api_schema';
import { clear, render, toSnakeCase } from './util';

/*
# Apiスキーマに関するコードを生成する
## 生成物一覧
- apps/api/src/model/generated/{category}.rs
  - RustのApiスキーマ定義
- apps/frontend/src/api/schemas/generated/{category}.ts
  - TypeScriptのApiスキーマ定義
- apps/frontend/src/api/schemas/generated_schemas.ts
  - TypeScriptスキーマ定義
- docs/open_api/api/schemas/generated/{category}.yaml
  - OpenAPIのApiスキーマ定義
- docs/open_api/api/schemas/generated_schemas.yaml
	- OpenAPIスキーマ定義
*/

const reset = () => {
  clear('apps/api/src/model/generated');
  clear('apps/frontend/src/api/schemas/generated');
  clear('apps/frontend/src/api/schemas/generated_schemas.ts');
  clear('docs/open_api/api/schemas/generated');
  clear('docs/open_api/api/schemas/generated_schemas.yaml');
};

export const generateApiSchemas = () => {
  reset();

  // スキーマをカテゴリ別にグループ化（apiSchemas.memberのキー名をカテゴリとして使用）
  const schemaGroups: Record<string, Schema[]> = {};

  for (const [category, categorySchemas] of Object.entries(apiSchemas.member)) {
    schemaGroups[category] = categorySchemas.map((s) => new Schema(s));
  }

  for (const [category, categorySchemas] of Object.entries(schemaGroups)) {
    // Rust
    render(
      buildRustSchemasText(categorySchemas),
      `apps/api/src/model/generated/${toSnakeCase(category)}.rs`,
    );

    // TypeScript
    render(
      buildTypescriptSchemasText(categorySchemas),
      `apps/frontend/src/api/schemas/generated/${toSnakeCase(category)}.ts`,
    );

    // OpenAPI
    render(
      buildOpenApiSchemasText(categorySchemas),
      `docs/open_api/api/schemas/generated/${category}.yaml`,
    );
  }

  // Rust mod.rs の生成
  const categories = Object.keys(schemaGroups);
  const rustModContent = buildRustModText(categories);
  render(rustModContent, 'apps/api/src/model/generated/mod.rs');

  // schemas/generated_schemas.tsを生成
  const schemasIndexText = buildSchemasReExportText(schemaGroups);
  render(
    schemasIndexText,
    'apps/frontend/src/api/schemas/generated_schemas.ts',
  );

  // schemas/generated_schemas.yamlの生成
  const schemasIndexContent = buildSchemasSummaryText(apiSchemas.member);
  render(
    schemasIndexContent,
    'docs/open_api/api/schemas/generated_schemas.yaml',
  );
};
