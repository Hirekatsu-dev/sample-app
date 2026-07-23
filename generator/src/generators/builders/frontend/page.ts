import type { Page } from '../../pages/page';

/**
 * EntryPointコンポーネントのVueテンプレートを生成
 */
export const buildEntryPointVue = (page: Page, allPages: Page[]) => {
  const lines: string[] = [
    '<script setup lang="ts">',
    '/**',
    ' * このファイルは generator/src/generators/pages.ts から生成されます。',
    ' * 直接編集しないでください。',
    ' */',
    '',
  ];

  // import文の生成
  const hasApis = page.apis.length > 0;
  const hasNavigations = page.navigations.length > 0;

  if (hasNavigations) {
    lines.push(`import { useRouter } from 'vue-router';`);
  }

  if (hasApis) {
    lines.push(`import type { IApi } from '@/api/api';`);
    lines.push(`import { useApi } from '@/composables/use_api';`);
  }

  // カスタムコンポーネントのimport
  lines.push(
    `import ${page.pascalName}Page from '@/pages/inner/${page.pascalName}Page.vue';`,
  );

  // 親レイアウトのcustomContext型のimport（Vue Routerネストの子ページの場合）
  if (page.hasParentWithCustomComponent && page.parent) {
    lines.push(
      `import type { ${page.parentCustomContextTypeName} } from '@/pages/inner/${page.parent.pascalName}Page.vue';`,
    );
  }

  lines.push('');

  // Context型のexport
  lines.push(`export interface ${page.pascalName}PageContext {`);
  if (hasApis) {
    lines.push(`  apis: ${page.apisTypeName};`);
  }
  if (hasNavigations) {
    lines.push(`  navigations: ${page.navigationsTypeName};`);
  }
  if (page.hasParentWithCustomComponent) {
    lines.push(`  parent: ${page.parentCustomContextTypeName};`);
  }
  // pathParamsもcontextに含める
  for (const param of page.pathParams) {
    lines.push(`  ${param.name}: string;`);
  }
  lines.push('}');
  lines.push('');

  // APIs型の定義
  if (hasApis) {
    lines.push(`export type ${page.apisTypeName} = {`);
    for (const api of page.apis) {
      const funcName = page.getApiFunctionName(api);
      lines.push(`  /** ${api.description || api.operationId} */`);
      lines.push(`  ${funcName}: IApi['${funcName}'];`);
    }
    lines.push('};');
    lines.push('');
  }

  // Navigations型の定義
  if (hasNavigations) {
    lines.push(`export type ${page.navigationsTypeName} = {`);
    for (const nav of page.navigations) {
      const funcName = page.getNavigationFunctionName(nav);
      const targetPage = allPages.find((p) => p.pname === nav.to);
      if (targetPage && targetPage.pathParams.length > 0) {
        const params = targetPage.pathParams
          .map((p) => `${p.name}: string`)
          .join(', ');
        lines.push(
          `  /** ${nav.label || nav.condition || `${nav.to}へ遷移`} */`,
        );
        lines.push(`  ${funcName}: (${params}) => void;`);
      } else {
        lines.push(
          `  /** ${nav.label || nav.condition || `${nav.to}へ遷移`} */`,
        );
        lines.push(`  ${funcName}: () => void;`);
      }
    }
    lines.push('};');
    lines.push('');
  }

  // インスタンスの生成
  if (hasApis) {
    lines.push('const api = useApi();');
  }
  if (hasNavigations) {
    lines.push('const router = useRouter();');
  }
  if (hasApis || hasNavigations) {
    lines.push('');
  }

  // propsの定義（pathParamsまたは親コンテキストがある場合）
  const hasPathParams = page.pathParams.length > 0;
  const needsProps = hasPathParams || page.hasParentWithCustomComponent;

  if (needsProps) {
    lines.push('const props = defineProps<{');
    for (const param of page.pathParams) {
      lines.push(`  ${param.name}: string;`);
    }
    if (page.hasParentWithCustomComponent) {
      lines.push(`  parentContext: ${page.parentCustomContextTypeName};`);
    }
    lines.push('}>();');
    lines.push('');
  }

  // API関数の定義
  if (hasApis) {
    lines.push(`const apis: ${page.apisTypeName} = {`);
    for (const api of page.apis) {
      const funcName = page.getApiFunctionName(api);
      lines.push(`  ${funcName}: api.${funcName}.bind(api),`);
    }
    lines.push('};');
    lines.push('');
  }

  // ナビゲーション関数の定義
  if (hasNavigations) {
    lines.push(`const navigations: ${page.navigationsTypeName} = {`);
    for (const nav of page.navigations) {
      const funcName = page.getNavigationFunctionName(nav);
      const targetPage = allPages.find((p) => p.pname === nav.to);
      if (targetPage && targetPage.pathParams.length > 0) {
        const params = targetPage.pathParams.map((p) => p.name).join(', ');
        lines.push(
          `  ${funcName}: (${params}: string) => router.push({ name: '${nav.to}', params: { ${params} } }),`,
        );
      } else {
        lines.push(`  ${funcName}: () => router.push({ name: '${nav.to}' }),`);
      }
    }
    lines.push('};');
    lines.push('');
  }

  // contextオブジェクトの生成
  lines.push(`const context: ${page.pascalName}PageContext = {`);
  if (hasApis) {
    lines.push('  apis,');
  }
  if (hasNavigations) {
    lines.push('  navigations,');
  }
  if (page.hasParentWithCustomComponent) {
    lines.push('  parent: props.parentContext,');
  }
  for (const param of page.pathParams) {
    lines.push(`  ${param.name}: props.${param.name},`);
  }
  lines.push('};');

  lines.push('</script>');
  lines.push('');
  lines.push('<template>');
  if (page.isLayoutRoute && page.passesCustomContext) {
    lines.push(
      `  <${page.pascalName}Page :context="context" v-slot="{ customContext }">`,
    );
    lines.push('    <router-view :parent-context="customContext" />');
    lines.push(`  </${page.pascalName}Page>`);
  } else {
    lines.push(`  <${page.pascalName}Page :context="context" />`);
  }
  lines.push('</template>');
  lines.push('');

  return lines.join('\n');
};
