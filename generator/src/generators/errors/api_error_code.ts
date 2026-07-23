import type { ApiErrorCode as ApiErrorCodeTemplate } from '@seed/errors';
import { toPascalCase } from '../util';

export class ApiErrorCode {
  readonly name: string;
  readonly message: string;
  readonly httpStatusCode: string;
  readonly code: string;

  constructor(error: ApiErrorCodeTemplate, _code: string) {
    this.name = error.pname;
    this.message = error.message;
    this.httpStatusCode = error.httpStatusCode;
    this.code = error.errorCode;
  }

  get frontendDifinitionText(): string {
    return `\t\t${toPascalCase(this.name)}: '${this.code}',\t// ${this.message}`;
  }

  get backendDifinitionText(): string {
    const attributes = [
      `\t#[strum(serialize = "${this.code}")]`,
      `\t#[serde(rename = "${this.code}")]`,
    ];

    if (this.name === 'Success') {
      attributes.push('\t#[default]');
    }

    return [
      ...attributes,
      `\t${toPascalCase(this.name)}, // ${this.message}`,
    ].join('\n');
  }
}
