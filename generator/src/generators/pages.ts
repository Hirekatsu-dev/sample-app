import { pages as pagesInput } from '../seed/pages';
import { buildPageDocumentText } from './builders/docs/screen/screen_detail';
import { buildScreenFlowText } from './builders/docs/screen/screen_flow';
import { buildEntryPointVue } from './builders/frontend/page';
import { buildRoutesTypeScript } from './builders/frontend/router';
import { Page } from './pages/page';
import { appTargets } from './targets';
import { clear, render } from './util';

/*
# 画面に関するコードを生成する
画面はアプリケーション固有のため、ターゲットごとの定義から生成する。
## 生成物一覧
- {screenDocRoot}/screen-flow.md
  - 画面遷移図（Mermaid形式）
- {screenDocRoot}/pages/{page_name}.md
  - 各画面の説明
- {frontendRoot}/src/pages/generated/{PageName}PageEntryPoint.vue
  - EntryPointコンポーネント
- {frontendRoot}/src/router/generated/routes.ts
  - ルート定義（Routes定数とroutes配列）
*/

/**
 * 出力ディレクトリをクリア
 */
const reset = () => {
  for (const target of appTargets) {
    clear(`${target.screenDocRoot}/screen-flow.md`);
    clear(`${target.screenDocRoot}/pages`);
    clear(`${target.frontendRoot}/src/pages/generated`);
    clear(`${target.frontendRoot}/src/router/generated`);
  }
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
  reset();

  for (const target of appTargets) {
    // トップレベルのページをPageインスタンスに変換（子ページも再帰的に生成される）
    const topLevelPages = pagesInput[target.key].map((p) => new Page(p));

    // すべてのページ（子孫含む）をフラット化
    const allPages = flattenPages(topLevelPages);

    // 画面遷移図（トップレベルのページ構造を使用してグルーピング）
    render(
      buildScreenFlowText(topLevelPages, allPages),
      `${target.screenDocRoot}/screen-flow.md`,
    );

    // 各画面のドキュメント
    for (const page of allPages) {
      render(
        buildPageDocumentText(page),
        `${target.screenDocRoot}/pages/${page.snakeName}.md`,
      );
    }

    // EntryPointコンポーネント
    for (const page of allPages) {
      render(
        buildEntryPointVue(page, allPages),
        `${target.frontendRoot}/src/pages/generated/${page.entryPointName}.vue`,
      );
    }

    // ルート定義
    render(
      buildRoutesTypeScript(allPages),
      `${target.frontendRoot}/src/router/generated/routes.ts`,
    );
  }
};
