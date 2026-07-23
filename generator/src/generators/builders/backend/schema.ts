import type { Schema } from '../../api_schemas/schema';
import { toSnakeCase } from '../../util';

export const buildRustSchemasText = (schemas: Schema[]) => {
  const structs = schemas.map((schema) => schema.rustStructText).join('\n\n');

  const content = [
    '// このファイルは generator/src/generators/api_schemas.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    '#[allow(unused_imports)]',
    'use chrono::{DateTime, Utc};',
    '#[allow(unused_imports)]',
    'use garde::Validate;',
    '#[allow(unused_imports)]',
    'use crate::model::id;',
    '#[allow(unused_imports)]',
    'use serde::{Deserialize, Serialize};',
    '#[allow(unused_imports)]',
    'use uuid::Uuid;',
    '',
    structs,
    '',
  ];

  return content.join('\n');
};

export const buildRustModText = (categories: string[]) => {
  const moduleDeclarations = categories
    .map((category) => `pub mod ${toSnakeCase(category)};`)
    .join('\n');

  const moduleUseStatements = categories
    .map((category) => `pub use ${toSnakeCase(category)}::*;`)
    .join('\n');

  const content = [
    '// このファイルは generator/src/generators/api_schemas.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    moduleDeclarations,
    moduleUseStatements,
    '',
  ];

  return content.join('\n');
};
