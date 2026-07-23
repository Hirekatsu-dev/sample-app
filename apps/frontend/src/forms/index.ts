import type { z as zod } from 'zod';

/** フォームのバリデーションエラー情報 */
export interface ValidationError<T> {
  /** フィールドごとのエラー（キーはフィールド名、値はエラーメッセージ） */
  fields: Partial<Record<keyof T, string>>;

  /** フィールドに紐づかないその他のエラーメッセージ */
  custom: string[];
}

export abstract class Form<T, P = T> {
  public readonly schema: zod.ZodSchema;
  validationErrors: ValidationError<T> = { fields: {}, custom: [] };

  public abstract fields: T;

  constructor(schema: zod.ZodSchema) {
    this.schema = schema;
  }

  /**
   * Zodスキーマによるフィールドバリデーションを実行し、
   * エラーを `validationErrors.fields` に格納する。
   * @returns バリデーション成功時 `true`
   */
  validateFields(): boolean {
    const result = this.schema.safeParse(this.fields);
    if (result.success) {
      return true;
    }

    for (const issue of result.error.issues) {
      const fieldKey = issue.path[0] as keyof T;
      if (fieldKey && !this.validationErrors.fields[fieldKey]) {
        this.validationErrors.fields[fieldKey] = issue.message;
      }
    }

    return false;
  }

  /**
   * フィールドバリデーションとカスタムバリデーションをすべて実行する。
   * エラーは `validationErrors` に格納される。
   * @returns バリデーション成功時 `true`
   */
  public validate() {
    this.clearErrors();

    const fieldResult = this.validateFields();

    const customValidationErrors = this.validateCustom();

    this.validationErrors.custom = customValidationErrors;

    return fieldResult && customValidationErrors.length === 0;
  }

  /** バリデーションエラーをすべてクリアする */
  clearErrors() {
    this.validationErrors = {
      fields: {},
      custom: [],
    };
  }

  public abstract toParams(): P;

  /**
   * フォーム全体のカスタムバリデーション。
   * 必要に応じてサブクラスでオーバーライドする。
   * @returns エラーメッセージの配列（空配列ならバリデーション成功）
   */
  validateCustom(): string[] {
    return [];
  }

  /** 現在のバリデーションエラー */
  public get errors(): ValidationError<T> {
    return this.validationErrors;
  }
}
