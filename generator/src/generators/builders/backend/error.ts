import type { ApiErrorCode } from '../../errors/api_error_code';
import { toPascalCase } from '../../util';

export const buildApiErrorCodesText = (errors: ApiErrorCode[]): string => {
  const content = [
    '// このファイルは generator/src/generators/errors.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    'use axum::http::StatusCode;',
    'use serde::Serialize;',
    '/// APIの結果コード',
    '#[allow(dead_code)]',
    '#[derive(Debug, Eq, PartialEq, Serialize, strum::EnumString, strum::Display)]',
    'pub enum ErrorCode {',
    ...errors.map((e) => e.backendDifinitionText),
    '}',
    '',
    'impl ErrorCode {',
    '\tpub fn http_status_code(&self) -> StatusCode {',
    '\t\tmatch &self {',
    ...errors.map((e) => {
      return `\t\tSelf::${toPascalCase(e.name)} => StatusCode::${e.httpStatusCode},`;
    }),
    '\t\t}',
    '\t}',
    '',
    '\t/// error_code に対応する既定のクライアント向けメッセージ',
    "\tpub fn default_message(&self) -> &'static str {",
    '\t\tmatch &self {',
    ...errors.map((e) => {
      const message = e.message.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `\t\tSelf::${toPascalCase(e.name)} => "${message}",`;
    }),
    '\t\t}',
    '\t}',
    '}',
    '',
  ].join('\n');

  return content;
};
