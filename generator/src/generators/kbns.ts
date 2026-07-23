import { kbns as kbnsInput } from '../seed/kbns';
import { buildApiKbnText } from './builders/backend/kbn';
import { buildMarkdownKbnText } from './builders/docs/constants/kbn';
import { buildFrontendKbnText } from './builders/frontend/kbn';
import { Kbn } from './kbns/kbn';
import { clear, render } from './util';

/*
# 区分値に関するコードを生成する
## 生成物一覧
- apps/api/src/kbn.rs
  - RustのEnum定義
- apps/frontend/src/kbn.ts
  - TypeScriptの定義
- docs/constants/kbn.md
  - 区分値一覧のドキュメント
*/

const reset = () => {
  clear('apps/api/src/kbn.rs');
  clear('apps/frontend/src/kbn.ts');
  clear('docs/constants/kbn.md');
};

export const generateKbns = () => {
  const kbns = kbnsInput.map((k, i) => {
    const code = String(i + 1).padStart(2, '0');
    return new Kbn(k, code);
  });

  reset();

  render(buildFrontendKbnText(kbns), 'apps/frontend/src/kbn.ts');

  render(buildApiKbnText(kbns), 'apps/api/src/kbn.rs');

  render(buildMarkdownKbnText(kbns), 'docs/constants/kbn.md');
};
