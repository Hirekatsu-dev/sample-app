import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import KtFormItem from './KtFormItem.vue';
import KtTextInput from './KtTextInput.vue';

const meta = {
  component: KtFormItem,
  argTypes: {
    title: {
      control: 'text',
    },
    description: {
      control: 'select',
      options: [undefined, 'description', 'description\nmultiple lines'],
    },
    error: {
      control: 'select',
      options: [undefined, 'error', 'error\nmultiple lines'],
    },
  },
  args: {
    title: 'title',
    description: undefined,
    error: undefined,
  },
} satisfies Meta<typeof KtFormItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const basic: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { KtFormItem, KtTextInput },
    setup() {
      const input = ref('');
      return { args, input };
    },
    template: `
        <KtFormItem
          v-bind="args"
        >
          <KtTextInput
            v-model="input"
          />
        </KtFormItem>
      `,
  }),
};

export const variation: Story = {
  render: () => ({
    components: { KtFormItem, KtTextInput },
    setup() {
      const args = [
        {
          title: '説明なしエラーなし',
        },
        {
          title: '説明あり',
          description: '説明です',
        },
        {
          title: '説明複数行',
          description: '・説明です\n・説明です',
        },
        {
          title: 'エラーあり',
          errorMessage: 'エラーです',
        },
        {
          title: 'エラー複数行',
          errorMessage: '・エラーです\n・エラーです',
        },
        {
          title: '説明+エラー',
          description: '説明です',
          errorMessage: 'エラーです',
        },
      ];

      return { args };
    },
    template: `
      <div class="flex flex-col items-start space-y-4">
        <div
          v-for="(arg, index) in args"
          class="space-y-2"
          :key="index"
        >
          <KtFormItem
            v-bind="arg"
          >
            <KtTextInput
              model-value=""
            />
          </KtFormItem>

          <hr
            class="border-t border-gray-300 w-full"
          />
        </div>
      </div>
      <div
        class="space-y-2"
        :key="index"
      >
        <KtFormItem
          title="スロット"
        >
          <KtTextInput
            model-value=""
          />
          <template #description>
            <div class="text-sm text-gray-500">
              スロットで説明をカスタマイズできます
            </div>
          </template>
          <template #error>
            <div class="text-sm text-red-500">
              スロットでエラーをカスタマイズできます
            </div>
          </template>
        </KtFormItem>
      </div>
    `,
  }),
};
