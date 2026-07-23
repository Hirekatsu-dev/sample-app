import type {
  Kbn as KbnTemplate,
  KbnValue as KbnValueTemplate,
} from '@seed/kbns';
import { toPascalCase } from '../util';

class KbnValue {
  readonly id: string;
  readonly name: string;
  readonly code: string;

  constructor(value: KbnValueTemplate, code: string) {
    this.id = value.id;
    this.name = value.name;
    this.code = code;
  }

  get frontendDifinitionText(): string {
    return `\t\t${toPascalCase(this.id)}: '${this.code}',\t// ${this.name}`;
  }

  get backendDifinitionText(): string {
    return [
      `\t#[strum(serialize = "${this.code}")]`,
      `\t#[serde(rename = "${this.code}")]`,
      `\t${toPascalCase(this.id)}, // ${this.name}`,
    ].join('\n');
  }

  get markdownTableRow(): string {
    return `| \`${this.code}\` | ${this.name} |`;
  }
}

export class Kbn {
  readonly id: string;
  readonly name: string;
  readonly values: KbnValue[];

  constructor(kbn: KbnTemplate, code: string) {
    this.id = kbn.id;
    this.name = kbn.name;
    this.values = kbn.values.map((v, i) => {
      const subCode = String(i + 1).padStart(3, '0');
      const valueCode = `${code}${subCode}`;
      return new KbnValue(v, valueCode);
    });
  }

  get frontendDifinitionText(): string {
    return [
      `\t${toPascalCase(this.id)}: { // ${this.name}`,
      ...this.values.map((v) => v.frontendDifinitionText),
      '\t},',
    ].join('\n');
  }

  get backendDifinitionText(): string {
    return [
      `/// ${this.name}`,
      '#[allow(dead_code)]',
      '#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, strum::EnumString, strum::Display)]',
      `pub enum ${toPascalCase(this.id)} {`,
      ...this.values.map((v) => v.backendDifinitionText),
      '}',
    ].join('\n');
  }

  get anchorId(): string {
    return `${this.id}_kbn`;
  }

  get markdownText(): string {
    return [
      `<a id="${this.anchorId}"></a>`,
      '',
      `## ${this.name}(${this.id}_kbn)`,
      '',
      '| 値 | 意味 |',
      '|---|---|',
      ...this.values.map((v) => v.markdownTableRow),
    ].join('\n');
  }
}
