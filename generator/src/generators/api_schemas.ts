import { apiSchemas } from '../seed/api_schemas';
import type { ApiSchema } from '../seed/api_schemas/types';
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
import { appTargets } from './targets';
import { clear, render, toSnakeCase } from './util';

/*
# Apiスキーマに関するコードを生成する
APIスキーマはアプリケーション固有のため、ターゲットごとの定義から生成する。
## 生成物一覧
- {backendRoot}/src/model/generated/{category}.rs
  - RustのApiスキーマ定義
- {frontendRoot}/src/api/schemas/generated/{category}.ts
  - TypeScriptのApiスキーマ定義
- {frontendRoot}/src/api/schemas/generated_schemas.ts
  - TypeScriptスキーマ定義
- {openApiRoot}/schemas/generated/{category}.yaml
  - OpenAPIのApiスキーマ定義
- {openApiRoot}/schemas/generated_schemas.yaml
	- OpenAPIスキーマ定義
*/

const reset = () => {
  for (const target of appTargets) {
    clear(`${target.backendRoot}/src/model/generated`);
    clear(`${target.frontendRoot}/src/api/schemas/generated`);
    clear(`${target.frontendRoot}/src/api/schemas/generated_schemas.ts`);
    clear(`${target.openApiRoot}/schemas/generated`);
    clear(`${target.openApiRoot}/schemas/generated_schemas.yaml`);
  }
};

export const generateApiSchemas = () => {
  reset();

  for (const target of appTargets) {
    // スキーマをカテゴリ別にグループ化（seed定義のキー名をカテゴリとして使用）
    const targetSchemas = apiSchemas[target.key] as Record<
      string,
      readonly ApiSchema[]
    >;
    const schemaGroups: Record<string, Schema[]> = {};

    for (const [category, categorySchemas] of Object.entries(targetSchemas)) {
      schemaGroups[category] = categorySchemas.map((s) => new Schema(s));
    }

    for (const [category, categorySchemas] of Object.entries(schemaGroups)) {
      // Rust
      render(
        buildRustSchemasText(categorySchemas),
        `${target.backendRoot}/src/model/generated/${toSnakeCase(category)}.rs`,
      );

      // TypeScript
      render(
        buildTypescriptSchemasText(categorySchemas),
        `${target.frontendRoot}/src/api/schemas/generated/${toSnakeCase(category)}.ts`,
      );

      // OpenAPI
      render(
        buildOpenApiSchemasText(categorySchemas),
        `${target.openApiRoot}/schemas/generated/${category}.yaml`,
      );
    }

    // Rust mod.rs の生成
    const categories = Object.keys(schemaGroups);
    const rustModContent = buildRustModText(categories);
    render(rustModContent, `${target.backendRoot}/src/model/generated/mod.rs`);

    // schemas/generated_schemas.tsを生成
    const schemasIndexText = buildSchemasReExportText(schemaGroups);
    render(
      schemasIndexText,
      `${target.frontendRoot}/src/api/schemas/generated_schemas.ts`,
    );

    // schemas/generated_schemas.yamlの生成
    const schemasIndexContent = buildSchemasSummaryText(targetSchemas);
    render(
      schemasIndexContent,
      `${target.openApiRoot}/schemas/generated_schemas.yaml`,
    );
  }
};
