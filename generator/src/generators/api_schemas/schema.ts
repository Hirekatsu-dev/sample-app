import type { ApiSchema, ApiSchemaProperty } from '@seed/api_schemas/types';
import { toCamelCase, toPascalCase, toSnakeCase } from '../util';

export class Schema {
  readonly name: string;
  readonly description?: string;
  readonly properties: SchemaProperty[];

  constructor(schema: ApiSchema) {
    this.name = schema.name;
    this.description = schema.description;
    this.properties = schema.properties.map((p) => new SchemaProperty(p));
  }

  get rustStructText(): string {
    const properties = this.properties.map((p) => p.rustFieldText).join('\n');

    const content = [
      this.description ? `/// ${this.description}` : undefined,
      '#[allow(dead_code)]',
      '#[derive(Debug, Clone, Serialize, Deserialize, Validate)]',
      `pub struct ${this.name} {`,
      properties,
      '}',
    ];

    return content.filter((line) => line !== undefined).join('\n');
  }

  get typescriptInterfaceText(): string {
    const properties = this.properties
      .map((p) => p.typescriptFieldText)
      .join('\n');

    const content = [
      this.description ? `/** ${this.description} */` : undefined,
      properties.length === 0
        ? '// biome-ignore lint/suspicious/noEmptyInterface: 自動生成のため'
        : undefined,
      `export interface ${this.name} {`,
      properties,
      '}',
    ];

    return content.filter((line) => line !== undefined).join('\n');
  }

  get openApiSchemaText(): string {
    const requiredFields = this.properties
      .filter((p) => p.required)
      .map((p) => `"${p.name}"`)
      .join(', ');

    const properties = this.properties
      .map((p) => p.openApiPropertyText)
      .join('\n');

    const content = [
      `${this.name}:`,
      '  type: object',
      this.description ? `  description: "${this.description}"` : undefined,
      requiredFields ? `  required: [${requiredFields}]` : undefined,
      '  properties:',
      properties,
    ];

    return content.filter((line) => line !== undefined).join('\n');
  }
}

export class SchemaProperty {
  readonly name: string;
  readonly type: string;
  readonly format?: string;
  readonly entityId?: string;
  readonly kbn?: string;
  readonly description?: string;
  readonly required: boolean;
  readonly nullable: boolean;
  readonly example?: unknown;
  readonly validation?: {
    length?: { min?: number; max?: number };
    min?: number;
    max?: number;
    regex?: string;
    custom?: string;
    unique?: boolean;
  };
  readonly items?: SchemaProperty;
  readonly properties?: SchemaProperty[];

  constructor(property: ApiSchemaProperty) {
    this.name = property.name;
    this.type = property.type;

    this.format =
      'format' in property
        ? (property as { format?: string }).format
        : undefined;
    this.entityId =
      property.type === 'string' && 'entityId' in property
        ? (property as { entityId?: string }).entityId
        : undefined;
    this.kbn =
      property.type === 'string' && 'kbn' in property
        ? (property as { kbn?: string }).kbn
        : undefined;
    this.description = property.description;
    this.required = property.required ?? false;
    this.nullable = property.nullable ?? false;
    this.example = property.example;
    this.validation =
      'validation' in property
        ? (property as { validation?: SchemaProperty['validation'] }).validation
        : undefined;

    this.items =
      property.type === 'array'
        ? new SchemaProperty((property as { items: ApiSchemaProperty }).items)
        : undefined;
    this.properties =
      property.type === 'object' && 'properties' in property
        ? (property as { properties: ApiSchemaProperty[] }).properties.map(
            (p) => new SchemaProperty(p),
          )
        : undefined;
  }

  get rustFieldText(): string {
    const rustType = this.getRustType();
    const serdeAttributes = this.getRustSerdeAttributes();
    const gardeAttributes = this.getGardeAttributes();

    const content = [
      this.description ? `    /// ${this.description}` : undefined,
      serdeAttributes ? `    ${serdeAttributes}` : undefined,
      gardeAttributes ? `    ${gardeAttributes}` : undefined,
      `    pub ${toSnakeCase(this.name)}: ${rustType},`,
    ];

    return content.filter((line) => line !== undefined).join('\n');
  }

  get typescriptFieldText(): string {
    const tsType = this.getTypescriptType();
    const type = this.required ? tsType : `${tsType} | null`;

    const content = [
      this.description ? `  /** ${this.description} */` : undefined,
      `  ${toCamelCase(this.name)}: ${type};`,
    ];

    return content.filter((line) => line !== undefined).join('\n');
  }

  get openApiPropertyText(): string {
    const openApiType = this.getOpenApiType();

    const content = [
      `    ${this.name}:`,
      `      type: ${openApiType.type}`,
      openApiType.format ? `      format: ${openApiType.format}` : undefined,
      this.description ? `      description: "${this.description}"` : undefined,
      this.nullable ? '      nullable: true' : undefined,
      this.example !== undefined
        ? `      example: ${JSON.stringify(this.example)}`
        : undefined,
    ];

    return content.filter((line) => line !== undefined).join('\n');
  }

  private getRustType(): string {
    let baseType: string;

    switch (this.type) {
      case 'string':
        if (this.format === 'uuid' && this.entityId) {
          baseType = `id::${this.entityId}`;
        } else if (this.format === 'uuid') {
          baseType = 'Uuid';
        } else if (this.format === 'date-time' || this.format === 'date') {
          baseType = 'DateTime<Utc>';
        } else if (this.kbn) {
          baseType = `shared::kbn::${toPascalCase(this.kbn)}`;
        } else {
          baseType = 'String';
        }
        break;
      case 'number':
        baseType = 'i64';
        break;
      case 'boolean':
        baseType = 'bool';
        break;
      case 'array': {
        const itemType = this.items?.getRustType() ?? 'String';
        baseType = `Vec<${itemType}>`;
        break;
      }
      default:
        baseType = 'String';
    }

    if (this.nullable || !this.required) {
      return `Option<${baseType}>`;
    }

    return baseType;
  }

  private getTypescriptType(): string {
    let baseType: string;

    switch (this.type) {
      case 'string':
        if (this.kbn) {
          baseType = `KbnType<'${toPascalCase(this.kbn)}'>`;
        } else {
          baseType = 'string';
        }
        break;
      case 'number':
        baseType = 'number';
        break;
      case 'boolean':
        baseType = 'boolean';
        break;
      case 'array': {
        const itemType = this.items?.getTypescriptType() ?? 'string';
        baseType = `${itemType}[]`;
        break;
      }
      default:
        baseType = 'string';
    }

    if (this.nullable) {
      return `${baseType} | null`;
    }

    return baseType;
  }

  private getOpenApiType(): { type: string; format?: string } {
    const result: { type: string; format?: string } = { type: this.type };

    if (this.format) {
      result.format = this.format;
    }

    return result;
  }

  private getRustSerdeAttributes(): string | undefined {
    const attributes: string[] = [];

    if (!this.required) {
      attributes.push('skip_serializing_if = "Option::is_none"');
    }

    return attributes.length > 0
      ? `#[serde(${attributes.join(', ')})]`
      : undefined;
  }

  private getGardeAttributes(): string | undefined {
    const attributes: string[] = [];

    if (this.validation) {
      if (this.validation.length) {
        if (
          this.validation.length.min !== undefined &&
          this.validation.length.max !== undefined
        ) {
          attributes.push(
            `length(min = ${this.validation.length.min}, max = ${this.validation.length.max})`,
          );
        } else if (this.validation.length.min !== undefined) {
          attributes.push(`length(min = ${this.validation.length.min})`);
        } else if (this.validation.length.max !== undefined) {
          attributes.push(`length(max = ${this.validation.length.max})`);
        }
      }

      // generator2 uses flat min/max for number validation (not range object)
      if (
        this.validation.min !== undefined &&
        this.validation.max !== undefined
      ) {
        attributes.push(
          `range(min = ${this.validation.min}, max = ${this.validation.max})`,
        );
      } else if (this.validation.min !== undefined) {
        attributes.push(`range(min = ${this.validation.min})`);
      } else if (this.validation.max !== undefined) {
        attributes.push(`range(max = ${this.validation.max})`);
      }

      if (this.validation.regex) {
        attributes.push(`pattern("${this.validation.regex}")`);
      }

      if (this.validation.custom) {
        attributes.push(this.validation.custom);
      }
    }

    if (this.format === 'email') {
      attributes.push('email');
    }

    if (this.format === 'url') {
      attributes.push('url');
    }

    if (attributes.length === 0) {
      attributes.push('skip');
    }

    return `#[garde(${attributes.join(', ')})]`;
  }
}
