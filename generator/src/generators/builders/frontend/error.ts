import type { ApiErrorCode } from '../../errors/api_error_code';

export const buildFrontendErrorCodesText = (errors: ApiErrorCode[]): string => {
  const content = [
    '// このファイルは generator/src/generators/errors.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    'export const ApiErrorCode = {',
    ...errors.map((e) => e.frontendDifinitionText),
    '} as const;',
    '',
  ].join('\n');
  return content;
};
