import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: 'vue-component-meta',
    },
  },
  stories: ['../src/**/*.stories.ts'],
  addons: [
    'storybook/actions',
    '@storybook/addon-vitest',
    "@storybook/addon-docs",
    '@storybook/addon-a11y'
  ],
  core: {
    builder: '@storybook/builder-vite',
  },
  docs: {
    defaultName: 'basic',
  },
};

export default config;
