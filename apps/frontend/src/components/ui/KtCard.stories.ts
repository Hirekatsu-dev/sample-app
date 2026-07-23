import type { Meta, StoryObj } from '@storybook/vue3-vite';
import KtCard from './KtCard.vue';

const meta = {
  component: KtCard,
  argTypes: {
    title: { control: 'text', description: 'カードのヘッダータイトル' },
    header: {
      control: 'text',
      description: 'カードのヘッダーに表示するテキスト',
    },
    footer: {
      control: 'text',
      description: 'カードのフッターに表示するテキスト',
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'カードの影の種類',
    },
  },
  args: {
    shadow: 'md',
  },
} satisfies Meta<typeof KtCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const Template: Story = {};

export const Default: Story = {
  ...Template,
};

export const NoShadow: Story = {
  ...Template,
  args: {
    shadow: 'none',
  },
};

export const Title: Story = {
  ...Template,
  args: {
    title: 'タイトル',
  },
};

export const Header: Story = {
  ...Template,
  args: {
    header: 'カスタムヘッダー',
  },
};

export const TitleAndHeader: Story = {
  ...Template,
  args: {
    header: 'カスタムヘッダー',
    title: 'タイトル',
  },
};

export const FooterProp: Story = {
  ...Template,
  args: {
    footer: 'カスタムフッター',
  },
  render: (args) => ({
    components: { KtCard },
    setup() {
      return { args };
    },
    template: `
      <KtCard v-bind="args">
    `,
  }),
};

export const FooterSlot: Story = {
  ...Template,
  args: {
    footer: 'カスタムフッター',
  },
  render: (args) => ({
    components: { KtCard },
    setup() {
      const footer = args.footer;

      return {
        args: {
          ...args,
          footer: undefined,
        },
        footer,
      };
    },
    template: `
      <KtCard v-bind="args">
        <template #footer>
          {{ footer }}
        </template>
      </KtCard>
    `,
  }),
};
