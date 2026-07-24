declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  // biome-ignore lint/complexity/noBannedTypes: 設定ファイルのため
  // biome-ignore lint/suspicious/noExplicitAny: 設定ファイルのため
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
