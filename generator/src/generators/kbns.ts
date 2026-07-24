import { kbns as kbnsInput } from '../seed/kbns';
import { buildApiKbnText } from './builders/backend/kbn';
import { buildMarkdownKbnText } from './builders/docs/constants/kbn';
import { buildFrontendKbnText } from './builders/frontend/kbn';
import { Kbn } from './kbns/kbn';
import { appTargets } from './targets';
import { clear, render } from './util';

/*
# 区分値に関するコードを生成する
区分値はDBを共有するため定義は共通とし、生成物を全ターゲットへ配布する。
## 生成物一覧
- {backendRoot}/src/kbn.rs
  - RustのEnum定義
- {frontendRoot}/src/kbn.ts
  - TypeScriptの定義
- docs/constants/kbn.md
  - 区分値一覧のドキュメント
*/

const reset = () => {
  for (const target of appTargets) {
    clear(`${target.backendRoot}/src/kbn.rs`);
    clear(`${target.frontendRoot}/src/kbn.ts`);
  }
  clear('docs/constants/kbn.md');
};

export const generateKbns = () => {
  const kbns = kbnsInput.map((k, i) => {
    const code = String(i + 1).padStart(2, '0');
    return new Kbn(k, code);
  });

  reset();

  for (const target of appTargets) {
    render(buildFrontendKbnText(kbns), `${target.frontendRoot}/src/kbn.ts`);

    render(buildApiKbnText(kbns), `${target.backendRoot}/src/kbn.rs`);
  }

  render(buildMarkdownKbnText(kbns), 'docs/constants/kbn.md');
};
