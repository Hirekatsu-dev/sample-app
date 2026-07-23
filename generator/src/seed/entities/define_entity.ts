import type { DomainKey, DomainToPname } from '@seed/domains';
import { domains } from '@seed/domains';
import type { KbnId } from '@seed/kbns';
import type {
  ApiSchemaProperty,
  ArrayApiSchemaProperty,
  BooleanApiSchemaProperty,
  DateTimeApiSchemaProperty,
  EmailApiSchemaProperty,
  KbnApiSchemaProperty,
  NumberApiSchemaProperty,
  StringApiSchemaProperty,
  UrlApiSchemaProperty,
  UuidApiSchemaProperty,
} from '../api_schemas/types';
// =====================
// FieldValidation (ドメインごとに厳密化)
// =====================

/** 文字列ドメインのバリデーション（内容、コード、名前、タイトル、Eメール、URL、パスワード、説明、ファイル名） */
export type StringFieldValidation = {
  length?: { min?: number; max?: number };
  regex?: string;
  custom?: string;
};

/** 数値ドメインのバリデーション（数、評価） */
export type NumberFieldValidation = {
  min?: number;
  max?: number;
  custom?: string;
};

/** 区分ドメインのバリデーション */
export type KbnFieldValidation = {
  kbn?: KbnId;
  custom?: string;
};

/** 内容配列・コード配列ドメインのバリデーション */
export type ContentArrayFieldValidation = {
  length?: { min?: number; max?: number };
  unique?: boolean;
  items?: StringFieldValidation;
  custom?: string;
};

/** 区分配列ドメインのバリデーション */
export type KbnArrayFieldValidation = {
  length?: { min?: number; max?: number };
  unique?: boolean;
  kbn?: KbnId;
  custom?: string;
};

/** ID配列・JSON配列ドメインのバリデーション */
export type SimpleArrayFieldValidation = {
  length?: { min?: number; max?: number };
  unique?: boolean;
  custom?: string;
};

/** ランタイム内部でのマージ処理に使用する広い型 */
type InternalValidation = {
  length?: { min?: number; max?: number };
  min?: number;
  max?: number;
  regex?: string;
  unique?: boolean;
  items?: InternalValidation;
  kbn?: KbnId;
  custom?: string;
};

// =====================
// FieldDefinition
// =====================

type BaseFieldDefinition = {
  readonly pname?: string;
  readonly lname?: string;
  readonly notNull?: boolean;
  readonly default?: string;
  readonly description?: string;
};

type NoValidationDomain = 'ID' | '日時' | 'JSON' | 'フラグ';
type StringDomain =
  | '内容'
  | 'コード'
  | '名前'
  | 'タイトル'
  | 'Eメール'
  | 'URL'
  | 'パスワード'
  | '説明'
  | 'ファイル名';
type NumberDomain = '数' | '評価';

/**
 * フィールドのバリデーション設定。
 * ドメインごとにデフォルト値が定められており、defineFields で上書き可能。
 * null を渡すとバリデーションなしになる。
 */
export type FieldDefinition =
  | (BaseFieldDefinition & {
      readonly domain: NoValidationDomain;
      readonly validation?: null;
    })
  | (BaseFieldDefinition & {
      readonly domain: StringDomain;
      readonly validation?: StringFieldValidation | null;
    })
  | (BaseFieldDefinition & {
      readonly domain: NumberDomain;
      readonly validation?: NumberFieldValidation | null;
    })
  | (BaseFieldDefinition & {
      readonly domain: '区分';
      readonly validation?: KbnFieldValidation | null;
    })
  | (BaseFieldDefinition & {
      readonly domain: '内容配列' | 'コード配列';
      readonly validation?: ContentArrayFieldValidation | null;
    })
  | (BaseFieldDefinition & {
      readonly domain: '区分配列';
      readonly validation?: KbnArrayFieldValidation | null;
    })
  | (BaseFieldDefinition & {
      readonly domain: 'ID配列' | 'JSON配列';
      readonly validation?: SimpleArrayFieldValidation | null;
    });

// =====================
// defineFields helper
// =====================

export function defineFields<T extends readonly FieldDefinition[]>(
  fields: T,
): T {
  return fields;
}

// =====================
// 型レベルの pname 抽出・プロパティ型マッピング
// =====================

/** FieldDefinition から物理カラム名（pname）を型レベルで抽出 */
type ExtractFieldPname<F extends FieldDefinition> = F extends {
  pname: infer P extends string;
  domain: infer D extends DomainKey;
}
  ? `${P}_${DomainToPname[D]}`
  : F extends { domain: infer D extends DomainKey }
    ? DomainToPname[D]
    : never;

/**
 * FieldDefinition の配列から全 pname の union 型を生成する。
 * schemaProperties / tableColumn の引数の型安全性に使用。
 */
export type ExtractAllPnames<T extends readonly FieldDefinition[]> =
  T extends readonly [
    infer Head extends FieldDefinition,
    ...infer Tail extends readonly FieldDefinition[],
  ]
    ? ExtractFieldPname<Head> | ExtractAllPnames<Tail>
    : never;

/** fields 配列から pname に一致する FieldDefinition を返す */
type FindFieldByPname<
  TFields extends readonly FieldDefinition[],
  TFieldPname extends string,
> = TFields extends readonly [
  infer Head extends FieldDefinition,
  ...infer Tail extends readonly FieldDefinition[],
]
  ? ExtractFieldPname<Head> extends TFieldPname
    ? Head
    : FindFieldByPname<Tail, TFieldPname>
  : never;

/** notNull: false のときは false、それ以外は true */
type FieldRequired<F extends FieldDefinition> = F extends { notNull: false }
  ? false
  : true;

/**
 * FieldDefinition のドメインから具体的な ApiSchemaProperty 型にマッピング。
 * name・required はフィールド定義から、entityId はエンティティ pname から算出。
 */
type FieldToApiPropertyType<
  F extends FieldDefinition,
  TEntityPname extends string,
> = F extends { domain: 'ID' }
  ? Omit<UuidApiSchemaProperty, 'name' | 'entityId' | 'required'> & {
      name: ExtractFieldPname<F>;
      entityId: `${Capitalize<TEntityPname>}Id`;
      required: FieldRequired<F>;
    }
  : F extends { domain: 'Eメール' }
    ? Omit<EmailApiSchemaProperty, 'name' | 'required'> & {
        name: ExtractFieldPname<F>;
        required: FieldRequired<F>;
      }
    : F extends { domain: 'URL' }
      ? Omit<UrlApiSchemaProperty, 'name' | 'required'> & {
          name: ExtractFieldPname<F>;
          required: FieldRequired<F>;
        }
      : F extends { domain: '日時' }
        ? Omit<DateTimeApiSchemaProperty, 'name' | 'required'> & {
            name: ExtractFieldPname<F>;
            required: FieldRequired<F>;
          }
        : F extends { domain: '数' | '評価' }
          ? Omit<NumberApiSchemaProperty, 'name' | 'required'> & {
              name: ExtractFieldPname<F>;
              required: FieldRequired<F>;
            }
          : F extends { domain: 'フラグ' }
            ? Omit<BooleanApiSchemaProperty, 'name' | 'required'> & {
                name: ExtractFieldPname<F>;
                required: FieldRequired<F>;
              }
            : F extends { domain: '区分' }
              ? (KbnApiSchemaProperty | StringApiSchemaProperty) & {
                  name: ExtractFieldPname<F>;
                  required: FieldRequired<F>;
                }
              : F extends {
                    domain:
                      | 'ID配列'
                      | '内容配列'
                      | 'コード配列'
                      | '区分配列'
                      | 'JSON配列';
                  }
                ? Omit<ArrayApiSchemaProperty, 'name' | 'required'> & {
                    name: ExtractFieldPname<F>;
                    required: FieldRequired<F>;
                  }
                : Omit<StringApiSchemaProperty, 'name' | 'required'> & {
                    name: ExtractFieldPname<F>;
                    required: FieldRequired<F>;
                  };

// =====================
// Entity 型定義
// =====================

export type EntityInput<
  TFields extends readonly FieldDefinition[],
  TPname extends string = string,
> = {
  /** 単数形の物理名 */
  pname: TPname;
  /** 論理名 */
  lname: string;
  fields: TFields;
};

export type EntityDefinition<
  TFields extends readonly FieldDefinition[],
  TPname extends string = string,
> = {
  readonly pname: TPname;
  readonly lname: string;
  readonly fields: TFields;
  /**
   * pname 指定でフィールドを選択し、ApiSchemaProperty として返す。
   * api_schemas の定義ファイルから参照して使用する。
   * pname はドメインのpnameを考慮した物理カラム名（例: "id", "email", "last_login_at"）。
   *
   * @example
   * export const userSchemas = [
   *   {
   *     name: 'GetMeResponseData',
   *     properties: [
   *       user.schemaProperties('id'),
   *       user.schemaProperties('name'),
   *       user.schemaProperties('email'),
   *     ],
   *   },
   * ] as const satisfies ApiSchema[];
   */
  schemaProperties<TFieldPname extends ExtractAllPnames<TFields>>(
    pname: TFieldPname,
  ): FieldToApiPropertyType<FindFieldByPname<TFields, TFieldPname>, TPname>;
  /**
   * pname 指定でフィールドを選択し、Column として返す。
   * tables の定義ファイルから参照して使用する。
   * pname はドメインのpnameを考慮した物理カラム名（例: "id", "email", "last_login_at"）。
   *
   * @example
   * export const userTable = defineTable({
   *   name: 'users',
   *   columns: [
   *     user.tableColumn('id'),
   *     user.tableColumn('name'),
   *     user.tableColumn('email'),
   *   ] as const,
   *   primaryKeys: ['id'],
   * });
   */
  tableColumn<TFieldPname extends ExtractAllPnames<TFields>>(
    pname: TFieldPname,
  ): Omit<FindFieldByPname<TFields, TFieldPname>, 'validation' | 'lname'>;
};

// =====================
// ランタイムヘルパー
// =====================

function resolveFieldPname(field: FieldDefinition): string {
  const domainPname = domains[field.domain].pname;
  if (field.pname) {
    return `${field.pname}_${domainPname}`;
  }
  return domainPname;
}

/**
 * ドメインのデフォルト validation とフィールドの上書き指定をマージする。
 * field.validation が null の場合はバリデーションなし（undefined を返す）。
 */
function mergeValidation(
  field: FieldDefinition,
): InternalValidation | undefined {
  if (field.validation === null) return undefined;
  const domainDefault = (
    domains[field.domain] as unknown as { validation?: InternalValidation }
  ).validation;
  const fieldValidation = field.validation as InternalValidation | undefined;
  if (!domainDefault && !fieldValidation) return undefined;
  const merged: InternalValidation = {
    ...(domainDefault ?? {}),
    ...(fieldValidation ?? {}),
  };
  if (domainDefault?.items || fieldValidation?.items) {
    merged.items = {
      ...(domainDefault?.items ?? {}),
      ...(fieldValidation?.items ?? {}),
    };
  }
  return merged;
}

function toStringValidation(
  v: InternalValidation | undefined,
):
  | { length?: { min?: number; max?: number }; regex?: string; custom?: string }
  | undefined {
  if (!v) return undefined;
  const r: {
    length?: { min?: number; max?: number };
    regex?: string;
    custom?: string;
  } = {};
  if (v.length) r.length = v.length;
  if (v.regex) r.regex = v.regex;
  if (v.custom) r.custom = v.custom;
  return Object.keys(r).length > 0 ? r : undefined;
}

function toNumberValidation(
  v: InternalValidation | undefined,
): { min?: number; max?: number; custom?: string } | undefined {
  if (!v) return undefined;
  const r: { min?: number; max?: number; custom?: string } = {};
  if (v.min !== undefined) r.min = v.min;
  if (v.max !== undefined) r.max = v.max;
  if (v.custom) r.custom = v.custom;
  return Object.keys(r).length > 0 ? r : undefined;
}

function toArrayValidation(v: InternalValidation | undefined):
  | {
      length?: { min?: number; max?: number };
      unique?: boolean;
      custom?: string;
    }
  | undefined {
  if (!v) return undefined;
  const r: {
    length?: { min?: number; max?: number };
    unique?: boolean;
    custom?: string;
  } = {};
  if (v.length) r.length = v.length;
  if (v.unique !== undefined) r.unique = v.unique;
  if (v.custom) r.custom = v.custom;
  return Object.keys(r).length > 0 ? r : undefined;
}

function buildArrayItem(
  arrayDomain: DomainKey,
  fieldValidation: InternalValidation | undefined,
): ApiSchemaProperty {
  const base = { name: '_item', required: true };
  const itemsValidation = fieldValidation?.items;

  switch (arrayDomain) {
    case '区分配列': {
      if (fieldValidation?.kbn) {
        return { ...base, type: 'string' as const, kbn: fieldValidation.kbn };
      }
      return { ...base, type: 'string' as const };
    }
    case '内容配列':
    case 'コード配列': {
      const sv = toStringValidation(itemsValidation);
      return {
        ...base,
        type: 'string' as const,
        ...(sv && { validation: sv }),
      };
    }
    default:
      return { ...base, type: 'string' as const };
  }
}

function domainToApiProperty(
  field: FieldDefinition,
  resolvedPname: string,
  entityPname: string,
): ApiSchemaProperty {
  const required = field.notNull !== false;
  const base = {
    name: resolvedPname,
    required,
    ...(field.description && { description: field.description }),
  };

  const v = mergeValidation(field);

  switch (field.domain) {
    case 'ID':
      return {
        ...base,
        type: 'string' as const,
        format: 'uuid' as const,
        entityId:
          `${entityPname.charAt(0).toUpperCase()}${entityPname.slice(1).replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())}Id` as never,
      };
    case 'Eメール': {
      const sv = toStringValidation(v);
      return {
        ...base,
        type: 'string' as const,
        format: 'email' as const,
        ...(sv && { validation: sv }),
      };
    }
    case 'URL': {
      const sv = toStringValidation(v);
      return {
        ...base,
        type: 'string' as const,
        format: 'url' as const,
        ...(sv && { validation: sv }),
      };
    }
    case '日時':
      return { ...base, type: 'string' as const, format: 'date-time' as const };
    case '数':
    case '評価': {
      const nv = toNumberValidation(v);
      return {
        ...base,
        type: 'number' as const,
        ...(nv && { validation: nv }),
      };
    }
    case 'フラグ':
      return { ...base, type: 'boolean' as const };
    case '区分': {
      if (v?.kbn) {
        return { ...base, type: 'string' as const, kbn: v.kbn };
      }
      const sv = toStringValidation(v);
      return {
        ...base,
        type: 'string' as const,
        ...(sv && { validation: sv }),
      };
    }
    case 'ID配列':
    case '内容配列':
    case 'コード配列':
    case '区分配列':
    case 'JSON配列': {
      const av = toArrayValidation(v);
      const items = buildArrayItem(field.domain, v);
      return {
        ...base,
        type: 'array' as const,
        items,
        ...(av && { validation: av }),
      };
    }
    default: {
      const sv = toStringValidation(v);
      return {
        ...base,
        type: 'string' as const,
        ...(sv && { validation: sv }),
      };
    }
  }
}

// =====================
// defineEntity
// =====================

export function defineEntity<
  TFields extends readonly FieldDefinition[],
  TPname extends string,
>(input: EntityInput<TFields, TPname>): EntityDefinition<TFields, TPname> {
  return {
    pname: input.pname,
    lname: input.lname,
    fields: input.fields,

    schemaProperties(pname) {
      const field = input.fields.find(
        (f) => resolveFieldPname(f) === (pname as string),
      );
      if (!field) throw new Error(`Field not found: ${String(pname)}`);
      const resolvedPname = resolveFieldPname(field);
      return domainToApiProperty(field, resolvedPname, input.pname) as never;
    },

    tableColumn(pname) {
      const field = input.fields.find(
        (f) => resolveFieldPname(f) === (pname as string),
      );
      if (!field) throw new Error(`Field not found: ${String(pname)}`);
      return {
        domain: field.domain,
        ...(field.pname !== undefined && { pname: field.pname }),
        ...(field.lname !== undefined && { lname: field.lname }),
        ...(field.notNull !== undefined && { notNull: field.notNull }),
        ...(field.default !== undefined && { default: field.default }),
        ...(field.description !== undefined && {
          description: field.description,
        }),
      } as never;
    },
  };
}
