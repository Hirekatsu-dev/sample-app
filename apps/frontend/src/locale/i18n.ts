import { createI18n } from 'vue-i18n';

import jaLocale from './ja.json';

const i18n = createI18n({
  legacy: false,
  locale: 'ja',
  fallbackLocale: 'ja',
  messages: {
    ja: jaLocale,
  },
});

export default i18n;
