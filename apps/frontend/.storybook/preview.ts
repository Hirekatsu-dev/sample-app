import type { Preview } from '@storybook/vue3-vite';

import '../src/style.css';
import '../src/tailwind.css';

import router from '../src/router';
import { registerDefaultIcons  } from '../src/composables/use_icon';

import AXE_LOCALE_JA from "axe-core/locales/ja.json";

import i18n from '../src/locale/i18n';
import { setup } from '@storybook/vue3';

setup((app) => {
  // https://zenn.dev/sa2knight/books/storybook-7-with-vue-3/viewer/vue-i18n
  // app が Vue インスタンスにあたるので Vue I18n インスタンスを注入する
  // 同一の Vue インスタンスに対して setup 関数は複数回実行されるため、既に注入済みかを確認する
  // biome-ignore lint/suspicious/noExplicitAny: Storybookの型定義が厳密でないためanyを許容する
  if (!(app as any).__VUE_I18N__) {
    app.use(i18n);
  }

  app.use(router);
  registerDefaultIcons();
});

const preview: Preview = {
  parameters: {
    a11y: {
      config: {
        locale: AXE_LOCALE_JA,
      },
      test: 'todo'
    },
  },
  tags: ['autodocs'],
};

export default preview;
