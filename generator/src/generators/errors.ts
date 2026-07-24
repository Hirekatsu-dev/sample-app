import { errors } from '../seed/errors';
import { buildApiErrorCodesText } from './builders/backend/error';
import { buildFrontendErrorCodesText } from './builders/frontend/error';
import { ApiErrorCode } from './errors/api_error_code';
import { appTargets, type TargetKey } from './targets';
import { clear, render } from './util';

/*
# エラーに関するコードを生成する
エラーコードはアプリケーション固有のため、ターゲットごとの定義から生成する。
## 生成物一覧
- {backendRoot}/src/error_code.rs
  - RustのEnum定義
- {frontendRoot}/src/error_code.ts
  - TypeScriptの定義
*/

// 内部コードはアプリケーションごとにプレフィックスを分ける
const codePrefixes: Record<TargetKey, string> = {
  member: '01',
  admin: '02',
};

const reset = () => {
  for (const target of appTargets) {
    clear(`${target.backendRoot}/src/error_code.rs`);
    clear(`${target.frontendRoot}/src/error_code.ts`);
  }
};

export const generateErrors = () => {
  reset();

  for (const target of appTargets) {
    const targetErrors = errors[target.key].map((e, i) => {
      const code = `${codePrefixes[target.key]}${String(i + 1).padStart(3, '0')}`;
      return new ApiErrorCode(e, code);
    });

    render(
      buildFrontendErrorCodesText(targetErrors),
      `${target.frontendRoot}/src/error_code.ts`,
    );

    render(
      buildApiErrorCodesText(targetErrors),
      `${target.backendRoot}/src/error_code.rs`,
    );
  }
};
