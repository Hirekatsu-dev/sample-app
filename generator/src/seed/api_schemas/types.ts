// APIスキーマの基本型定義

import type { EntityId } from '../entity_ids';
import type { kbns } from '../kbns';
import type { memberApiSchema } from './definitions/member_api';

interface BaseApiSchemaProperty {
  name: string;
  description?: string;
  required?: boolean;
  nullable?: boolean;
  example?: unknown;
}

export interface StringValidation {
  length?: { min?: number; max?: number };
  regex?: string;
  custom?: string;
}

export interface NumberValidation {
  min?: number;
  max?: number;
  custom?: string;
}

export interface ArrayValidation {
  length?: { min?: number; max?: number };
  unique?: boolean;
  custom?: string;
}

export interface StringApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'string';
  validation?: StringValidation;
}

export interface EmailApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'string';
  format: 'email';
  validation?: StringValidation;
}

export interface DateTimeApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'string';
  format: 'date-time';
}

export interface DateApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'string';
  format: 'date';
}

export interface UrlApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'string';
  format: 'url';
  validation?: StringValidation;
}

export interface UuidApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'string';
  format: 'uuid';
  entityId: EntityId;
}

export interface KbnApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'string';
  kbn: (typeof kbns)[number]['id'];
}

export interface NumberApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'number';
  validation?: NumberValidation;
}

export interface BooleanApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'boolean';
}

export interface ArrayApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'array';
  items: ApiSchemaProperty; // array型の場合の要素型
  validation?: ArrayValidation;
}

export interface ObjectApiSchemaProperty extends BaseApiSchemaProperty {
  type: 'object';
  ref?: MemberApiSchemaNames;
}

export type ApiSchemaProperty =
  | StringApiSchemaProperty
  | EmailApiSchemaProperty
  | DateTimeApiSchemaProperty
  | DateApiSchemaProperty
  | UrlApiSchemaProperty
  | UuidApiSchemaProperty
  | KbnApiSchemaProperty
  | NumberApiSchemaProperty
  | BooleanApiSchemaProperty
  | ArrayApiSchemaProperty
  | ObjectApiSchemaProperty;

export interface ApiSchema {
  name: string;
  description?: string;
  properties: ApiSchemaProperty[];
}

type MemberApiSchema =
  (typeof memberApiSchema)[keyof typeof memberApiSchema][number];

export type MemberApiSchemaNames = MemberApiSchema['name'];
