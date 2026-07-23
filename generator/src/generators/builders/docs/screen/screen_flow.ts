import type { Page as SeedPage } from '@seed/pages';
import type { Page } from '../../../pages/page';
import { ScreenFlow } from '../../../pages/screen_flow';

const toSeedPage = (p: Page): SeedPage => ({
  pname: p.pname,
  lname: p.lname,
  path: p.path,
  description: p.description,
  requiresAuth: p.requiresAuth,
  apis: p.apis,
  navigations: p.navigations,
  pathParams: p.pathParams,
  queryParams: p.queryParams,
  children: p.children.length > 0 ? p.children.map(toSeedPage) : undefined,
});

export const buildScreenFlowText = (
  topLevelPages: Page[],
  allPages: Page[],
) => {
  const screenFlow = new ScreenFlow(topLevelPages.map(toSeedPage));

  const pageLinks = [...allPages]
    .sort((a, b) => a.pname.localeCompare(b.pname))
    .map((p) => `- [${p.lname}(${p.pname})](./pages/${p.snakeName}.md)`)
    .join('\n');

  const content = [
    '# 画面遷移図',
    '',
    'このファイルは generator/src/generators/pages.ts から生成されます。',
    '直接編集しないでください。',
    '',
    '## 画面一覧',
    '',
    pageLinks,
    '',
    '## 凡例',
    '',
    '- 🔒 認証が必要な画面',
    '- 緑枠: 公開画面',
    '- 青枠: 認証必須画面',
    '',
    '## 画面遷移図',
    '',
    '```mermaid',
    screenFlow.mermaidText,
    '```',
    '',
  ];

  return content.join('\n');
};
