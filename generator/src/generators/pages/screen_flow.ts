import type { Page } from '@seed/pages';

/**
 * 画面遷移図を生成するクラス
 */
export class ScreenFlow {
  readonly pages: Page[];

  constructor(pages: Page[]) {
    this.pages = pages;
  }

  /**
   * ページのすべての子孫をフラットに取得
   */
  private flattenDescendants(page: Page): Page[] {
    const result: Page[] = [];
    for (const child of page.children ?? []) {
      result.push(child);
      result.push(...this.flattenDescendants(child));
    }
    return result;
  }

  /**
   * すべてのページ（子孫含む）をフラットに取得
   */
  private getAllPages(): Page[] {
    const result: Page[] = [];
    for (const page of this.pages) {
      result.push(page);
      result.push(...this.flattenDescendants(page));
    }
    return result;
  }

  /**
   * ページをMermaidサブグラフまたはノードとして再帰的に出力する。
   * childrenを持つページはサブグラフ（自ノードなし）、葉ページは通常ノードとして描画する。
   */
  private buildSubgraph(lines: string[], page: Page, indent: number): void {
    const pad = '    '.repeat(indent);
    const authIcon = page.requiresAuth ? '🔒 ' : '';
    const desc = page.lname || page.pname;

    if (page.children && page.children.length > 0) {
      lines.push(`${pad}subgraph group_${page.pname}["${desc}"]`);
      for (const child of page.children) {
        this.buildSubgraph(lines, child, indent + 1);
      }
      lines.push(`${pad}end`);
    } else {
      lines.push(`${pad}${page.pname}["${authIcon}${desc}"]`);
    }
  }

  /**
   * Mermaid形式のフローチャートテキストを生成
   */
  get mermaidText(): string {
    const lines: string[] = ['flowchart TD'];
    const allPages = this.getAllPages();

    // トップレベルページをサブグラフまたはノードとして描画
    lines.push('');
    for (const page of this.pages) {
      this.buildSubgraph(lines, page, 0);
      lines.push('');
    }

    // 遷移定義
    lines.push('    %% 画面遷移');
    for (const page of allPages) {
      if (!page.navigations) continue;

      for (const nav of page.navigations) {
        const targetPage = allPages.find((p) => p.pname === nav.to);
        if (!targetPage) continue;

        if (nav.condition) {
          lines.push(`    ${page.pname} -->|${nav.condition}| ${nav.to}`);
        } else if (nav.label) {
          lines.push(`    ${page.pname} -->|${nav.label}| ${nav.to}`);
        } else {
          lines.push(`    ${page.pname} --> ${nav.to}`);
        }
      }
    }

    // スタイル定義
    lines.push('');
    lines.push('    %% スタイル');
    const authPages = allPages.filter((p) => p.requiresAuth);
    const publicPages = allPages.filter((p) => !p.requiresAuth);

    if (authPages.length > 0) {
      lines.push(
        `    classDef authRequired fill:#e0f2fe,stroke:#0284c7,stroke-width:2px`,
      );
      lines.push(
        `    class ${authPages.map((p) => p.pname).join(',')} authRequired`,
      );
    }

    if (publicPages.length > 0) {
      lines.push(
        `    classDef public fill:#f0fdf4,stroke:#16a34a,stroke-width:1px`,
      );
      lines.push(
        `    class ${publicPages.map((p) => p.pname).join(',')} public`,
      );
    }

    return lines.join('\n');
  }

  /**
   * 画面グループ別の遷移情報を取得
   */
  getPageGroups(): Map<string, Page[]> {
    const groups = new Map<string, Page[]>();
    const allPages = this.getAllPages();

    const authPages: Page[] = [];
    const publicPages: Page[] = [];

    for (const page of allPages) {
      if (page.requiresAuth) {
        authPages.push(page);
      } else {
        publicPages.push(page);
      }
    }

    groups.set('認証が必要な画面', authPages);
    groups.set('公開画面', publicPages);

    return groups;
  }
}
