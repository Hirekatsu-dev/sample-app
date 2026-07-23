import type { Page } from '../../../pages/page';
import { toSnakeCase } from '../../../util';

/**
 * 各画面のドキュメントMarkdownを生成
 */
export const buildPageDocumentText = (page: Page) => {
  const content: string[] = [
    `# ${page.lname || page.pname}`,
    '',
    '[← 画面遷移図に戻る](../screen-flow.md)',
    '',
    'このファイルは generator/src/generators/pages.ts から生成されます。',
    '直接編集しないでください。',
    '',
  ];

  // 説明
  if (page.description) {
    content.push(page.description, '');
  }

  // 基本情報
  content.push('## 基本情報', '');
  content.push(`| 項目 | 値 |`);
  content.push(`|------|-----|`);
  content.push(`| パス | \`${page.path}\` |`);
  content.push(`| 認証 | ${page.requiresAuth ? '必要 🔒' : '不要'} |`);
  content.push('');

  // パスパラメータ
  if (page.pathParams.length > 0) {
    content.push('## パスパラメータ', '');
    content.push('| パラメータ名 | 型 | 説明 |');
    content.push('|-------------|-----|------|');
    for (const param of page.pathParams) {
      const typeStr =
        param.type === 'id' && param.entityId
          ? `UUID (${param.entityId})`
          : param.type;
      content.push(
        `| ${param.name} | ${typeStr} | ${param.description || ''} |`,
      );
    }
    content.push('');
  }

  // クエリパラメータ
  if (page.queryParams.length > 0) {
    content.push('## クエリパラメータ', '');
    content.push('| パラメータ名 | 型 | 必須 | 説明 |');
    content.push('|-------------|-----|------|------|');
    for (const param of page.queryParams) {
      const required = param.required ? '✓' : '';
      content.push(
        `| ${param.name} | ${param.type} | ${required} | ${param.description || ''} |`,
      );
    }
    content.push('');
  }

  // 使用API
  if (page.apis.length > 0) {
    content.push('## 使用API', '');
    content.push('| Operation ID | 用途 |');
    content.push('|--------------|------|');
    for (const api of page.apis) {
      content.push(
        `| ${toSnakeCase(api.operationId)} | ${api.description || ''} |`,
      );
    }
    content.push('');
  }

  // 遷移先
  if (page.navigations.length > 0) {
    content.push('## 遷移先', '');
    content.push('| 遷移先 | ラベル/条件 |');
    content.push('|--------|------------|');
    for (const nav of page.navigations) {
      const labelOrCondition = nav.condition || nav.label || '';
      content.push(
        `| [${nav.to}](./${toSnakeCase(nav.to)}.md) | ${labelOrCondition} |`,
      );
    }
    content.push('');
  }

  return content.join('\n');
};
