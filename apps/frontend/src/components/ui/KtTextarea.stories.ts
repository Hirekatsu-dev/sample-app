import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import KtTextarea from './KtTextarea.vue';

type Args = ComponentProps<typeof KtTextarea> & {
  'onUpdate:modelValue'?: (value: string) => void;
};

const meta: Meta<Args> = {
  component: KtTextarea,
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'テキストエリアの値 (v-model)',
    },
    placeholder: { control: 'text', description: 'プレースホルダー' },
    disabled: { control: 'boolean', description: '非活性状態にするかどうか' },
    rows: { control: 'number', description: '行数' },
    cols: { control: 'number', description: '列数' },
    resize: {
      control: 'select',
      options: ['none', 'both', 'horizontal', 'vertical', 'block', 'inline'],
      description: 'リサイズ可能な方向',
    },
  },
  args: {
    modelValue: '',
  },
} satisfies Meta<typeof KtTextarea>;
export default meta;

type Story = StoryObj<Args>;

const Template: Story = {};

export const Default: Story = {
  ...Template,
  args: {
    modelValue: '',
    placeholder: 'ここに入力してください',
    disabled: false,
    rows: 4,
    cols: 40,
    resize: 'both',
  },
};

export const WithPlaceholder: Story = {
  ...Template,
  args: {
    modelValue: '',
    placeholder: 'プレースホルダー付きのテキストエリア',
    disabled: false,
    rows: 4,
    cols: 40,
    resize: 'both',
  },
};

export const Disabled: Story = {
  ...Template,
  args: {
    modelValue: 'このテキストエリアは非活性です',
    placeholder: '非活性状態',
    disabled: true,
    rows: 4,
    cols: 40,
    resize: 'both',
  },
};

export const CustomSize: Story = {
  ...Template,
  args: {
    modelValue: '',
    placeholder: 'カスタム行数と列数',
    disabled: false,
    rows: 8,
    cols: 60,
    resize: 'horizontal',
  },
};

export const Variation: Story = {
  render: (args) => ({
    components: { KtTextarea },
    setup() {
      const value1 = ref('');
      const value2 = ref('初期値あり\n複数行のテキスト');
      const value3 = ref('');
      const value4 = ref('編集不可のテキスト\n改行も含まれています');
      return { args, value1, value2, value3, value4 };
    },
    template: `
      <div class="flex flex-col space-y-4">
        <div class="flex items-start space-x-2">
          <span class="w-32 pt-2">通常</span>
          <KtTextarea
            v-model="value1"
            placeholder="プレースホルダー"
            :rows="3"
            :cols="40"
          />
          <span class="text-gray-500 pt-2">値: {{ value1 }}</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="w-32 pt-2">初期値あり</span>
          <KtTextarea
            v-model="value2"
            placeholder="プレースホルダー"
            :rows="3"
            :cols="40"
          />
          <span class="text-gray-500 pt-2">値: {{ value2 }}</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="w-32 pt-2">リサイズ不可</span>
          <KtTextarea
            v-model="value3"
            placeholder="リサイズできません"
            :rows="3"
            :cols="40"
            resize="none"
          />
          <span class="text-gray-500 pt-2">値: {{ value3 }}</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="w-32 pt-2">非活性</span>
          <KtTextarea
            v-model="value4"
            placeholder="非活性"
            :rows="3"
            :cols="40"
            disabled
          />
          <span class="text-gray-500 pt-2">値: {{ value4 }}</span>
        </div>
      </div>
    `,
  }),
};

const interactionTemplate: StoryFn<Args> = (args) => ({
  components: { KtTextarea },
  setup() {
    const value = ref(args.modelValue || '');
    return { args, value };
  },
  template:
    '<KtTextarea v-model="value" v-bind="args" @update:modelValue="args[\'onUpdate:modelValue\']" />',
});

export const Interaction = interactionTemplate.bind({});
Interaction.args = {
  placeholder: 'テストプレースホルダー',
  rows: 4,
  cols: 40,
  'onUpdate:modelValue': fn(),
};

export const InteractionDisabled = interactionTemplate.bind({});
InteractionDisabled.args = {
  modelValue: '編集不可のテキスト\n複数行のコンテンツ',
  placeholder: 'テストプレースホルダー',
  rows: 4,
  cols: 40,
  disabled: true,
  'onUpdate:modelValue': fn(),
};

Interaction.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  const textarea = canvas.getByRole('textbox') as HTMLTextAreaElement;

  await step('テキストエリアが表示される', async () => {
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'テストプレースホルダー');
    expect(textarea).toBeEnabled();
  });

  await step('テキストを入力できる', async () => {
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Hello World');
    await waitFor(() => expect(textarea).toHaveValue('Hello World'));
  });

  await step('フォーカスがあたる', async () => {
    textarea.focus();
    expect(textarea).toHaveFocus();
  });

  await step('改行を入力できる', async () => {
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');
    await waitFor(() => expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3'));
  });

  await step('テキストをクリアできる', async () => {
    await userEvent.clear(textarea);
    await waitFor(() => expect(textarea).toHaveValue(''));
  });

  await step('長いテキストを入力できる', async () => {
    const longText = 'これは長いテキストです。'.repeat(10);
    await userEvent.type(textarea, longText);
    await waitFor(() => expect(textarea).toHaveValue(longText));
  });

  await step('複数の空白文字を入力できる', async () => {
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Before    After');
    await waitFor(() => expect(textarea).toHaveValue('Before    After'));
  });
};

InteractionDisabled.play = async ({ args, canvasElement, step }) => {
  const canvas = within(canvasElement);
  const textarea = canvas.getByRole('textbox') as HTMLTextAreaElement;

  await step('テキストエリアが非活性状態で表示される', async () => {
    expect(textarea).toBeInTheDocument();
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveValue('編集不可のテキスト\n複数行のコンテンツ');
  });

  await step('テキストを入力できない', async () => {
    const initialValue = textarea.value;
    await userEvent.type(textarea, 'New Text');
    await waitFor(() => expect(textarea).toHaveValue(initialValue));
    expect(args['onUpdate:modelValue']).not.toHaveBeenCalled();
  });

  await step('フォーカスが当たらない', async () => {
    textarea.focus();
    expect(textarea).not.toHaveFocus();
  });
};
