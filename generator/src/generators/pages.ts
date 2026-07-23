import { pages as pagesInput } from '../seed/pages';
import { buildPageDocumentText } from './builders/docs/screen/screen_detail';
import { buildScreenFlowText } from './builders/docs/screen/screen_flow';
import { buildEntryPointVue } from './builders/frontend/page';
import { buildRoutesTypeScript } from './builders/frontend/router';
import { Page } from './pages/page';
import { clear, render } from './util';

/*
# 画面に関するコードを生成する
## 生成物一覧
- docs/screens/screen-flow.md
  - 画面遷移図（Mermaid形式）
- docs/screens/pages/{page_name}.md
  - 各画面の説明
- apps/frontend/src/pages/generated/{PageName}PageEntryPoint.vue
  - EntryPointコンポーネント
- apps/frontend/src/router/generated/routes.ts
  - ルート定義（Routes定数とroutes配列）
*/

/**
 * 出力ディレクトリをクリア
 */
const reset = () => {
  clear('docs/screens/screen-flow.md');
  clear('docs/screens/pages');
  clear('apps/frontend/src/pages/generated');
  clear('apps/frontend/src/router/generated');
};

/**
 * ページとその子孫をフラットな配列として取得
 */
const flattenPages = (pages: Page[]): Page[] => {
  const result: Page[] = [];
  for (const page of pages) {
    result.push(page);
    result.push(...page.getAllDescendants());
  }
  return result;
};

/**
 * 画面関連のコードを生成
 */
export const generatePages = () => {
  // トップレベルのページをPageインスタンスに変換（子ページも再帰的に生成される）
  const topLevelPages = pagesInput.map((p) => new Page(p));

  // すべてのページ（子孫含む）をフラット化
  const allPages = flattenPages(topLevelPages);

  reset();

  // 画面遷移図（トップレベルのページ構造を使用してグルーピング）
  render(
    buildScreenFlowText(topLevelPages, allPages),
    'docs/screens/screen-flow.md',
  );

  // 各画面のドキュメント
  for (const page of allPages) {
    render(
      buildPageDocumentText(page),
      `docs/screens/pages/${page.snakeName}.md`,
    );
  }

  // EntryPointコンポーネント
  for (const page of allPages) {
    render(
      buildEntryPointVue(page, allPages),
      `apps/frontend/src/pages/generated/${page.entryPointName}.vue`,
    );
  }

  // ルート定義
  render(
    buildRoutesTypeScript(allPages),
    'apps/frontend/src/router/generated/routes.ts',
  );
};
