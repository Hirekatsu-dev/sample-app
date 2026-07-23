import type { Page } from '../../pages/page';

const buildRouteEntry = (
  lines: string[],
  page: Page,
  parentPath: string | null,
  depth: number,
): void => {
  const pad = '  '.repeat(depth + 1);
  const path =
    parentPath !== null ? page.relativePathFrom(parentPath) : page.path;

  lines.push(`${pad}{`);
  lines.push(`${pad}  path: '${path}',`);

  if (page.isLayoutRoute) {
    lines.push(`${pad}  component: ${page.entryPointName},`);
    if (page.requiresAuth) {
      lines.push(`${pad}  meta: {`);
      lines.push(`${pad}    requiresAuth: true,`);
      lines.push(`${pad}  },`);
    }
    lines.push(`${pad}  children: [`);
    for (const child of page.children) {
      buildRouteEntry(lines, child, page.path, depth + 1);
    }
    lines.push(`${pad}  ],`);
  } else {
    lines.push(`${pad}  name: Routes.${page.pascalName},`);
    lines.push(`${pad}  component: ${page.entryPointName},`);
    if (page.pathParams.length > 0) {
      lines.push(`${pad}  props: true,`);
    }
    if (page.requiresAuth) {
      lines.push(`${pad}  meta: {`);
      lines.push(`${pad}    requiresAuth: true,`);
      lines.push(`${pad}  },`);
    }
  }

  lines.push(`${pad}},`);
};

/**
 * ルート定義のTypeScriptを生成
 */
export const buildRoutesTypeScript = (allPages: Page[]) => {
  const lines: string[] = [
    '/**',
    ' * このファイルは generator/src/generators/pages.ts から生成されます。',
    ' * 直接編集しないでください。',
    ' */',
    "import type { RouteRecordRaw } from 'vue-router';",
    '',
  ];

  // EntryPointコンポーネントのimport
  for (const page of allPages) {
    lines.push(
      `import ${page.entryPointName} from '@/pages/generated/${page.entryPointName}.vue';`,
    );
  }
  lines.push('');

  // Routes定数の生成（isLayoutRouteなページはnameを持たないが定数には含める）
  lines.push('/**');
  lines.push(' * ルート名の定数');
  lines.push(' */');
  lines.push('export const Routes = Object.freeze({');
  for (const page of allPages) {
    lines.push(`  ${page.pascalName}: '${page.pascalName}',`);
  }
  lines.push('});');
  lines.push('');

  // isLayoutRoute な親の直接の子ページをセットに収集
  const routerChildSet = new Set(
    allPages.filter((p) => p.isLayoutRoute).flatMap((p) => p.children),
  );

  // ネストルートの子ではないページをトップレベルに出力
  const rootLevelPages = allPages.filter((p) => !routerChildSet.has(p));

  // routes配列の生成
  lines.push('/**');
  lines.push(' * 自動生成されたルート定義');
  lines.push(
    ' * カスタムルート（レイアウト、リダイレクトなど）は router/routes.ts で追加してください',
  );
  lines.push(' */');
  lines.push('export const generatedRoutes: Array<RouteRecordRaw> = [');

  for (const page of rootLevelPages) {
    buildRouteEntry(lines, page, null, 0);
  }

  lines.push('];');
  lines.push('');

  return lines.join('\n');
};
