import { errors } from '../seed/errors';
import { buildApiErrorCodesText } from './builders/backend/error';
import { buildFrontendErrorCodesText } from './builders/frontend/error';
import { ApiErrorCode } from './errors/api_error_code';
import { clear, render } from './util';

/*
# エラーに関するコードを生成する
## 生成物一覧
- apps/api/src/error_code.rs
  - RustのEnum定義
- apps/frontend/src/error_code.ts
  - TypeScriptの定義
*/

const reset = () => {
  clear('apps/api/src/error_code.rs');
  clear('apps/frontend/src/error_code.ts');
};

export const generateErrors = () => {
  const memberErrors = errors.member.map((e, i) => {
    const code = `01${String(i + 1).padStart(3, '0')}`;
    return new ApiErrorCode(e, code);
  });

  reset();

  render(
    buildFrontendErrorCodesText(memberErrors),
    'apps/frontend/src/error_code.ts',
  );

  render(buildApiErrorCodesText(memberErrors), 'apps/api/src/error_code.rs');
};
