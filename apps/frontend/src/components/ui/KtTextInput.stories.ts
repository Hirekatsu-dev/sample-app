import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import KtTextInput from './KtTextInput.vue';

type Args = ComponentProps<typeof KtTextInput> & {
  'onUpdate:modelValue'?: (value: string) => void;
};

type Story = StoryObj<Args>;

const meta: Meta<Args> = {
  component: KtTextInput,
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'テキストフィールドの値 (v-model)',
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダー',
    },
    disabled: {
      control: 'boolean',
      description: '非活性にするかどうか',
    },
    autocomplete: {
      control: 'text',
      description: '入力のタイプ',
    },
  },
  args: {
    modelValue: '',
    placeholder: undefined,
    disabled: false,
    autocomplete: 'off',
  },
};

export default meta;

export const Default: Story = {
  args: {
    modelValue: '',
    placeholder: 'ここに入力してください',
  },
};

export const WithValue: Story = {
  args: {
    modelValue: '初期値があるテキストフィールド',
    placeholder: 'プレースホルダー',
  },
};

export const WithPlaceholder: Story = {
  args: {
    modelValue: '',
    placeholder: 'メールアドレスを入力',
  },
};

export const Disabled: Story = {
  args: {
    modelValue: '編集不可のテキスト',
    placeholder: '非活性状態',
    disabled: true,
  },
};

export const WithAutocomplete: Story = {
  args: {
    modelValue: '',
    placeholder: 'メールアドレス',
    autocomplete: 'email',
  },
};

export const Variation: Story = {
  render: (args) => ({
    components: { KtTextInput },
    setup() {
      const value1 = ref('');
      const value2 = ref('初期値あり');
      const value3 = ref('');
      const value4 = ref('編集不可');
      return { args, value1, value2, value3, value4 };
    },
    template: `
      <div class="flex flex-col space-y-4">
        <div class="flex items-center space-x-2">
          <span class="w-32">通常</span>
          <KtTextInput
            v-model="value1"
            placeholder="プレースホルダー"
          />
          <span class="text-gray-500">値: {{ value1 }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-32">初期値あり</span>
          <KtTextInput
            v-model="value2"
            placeholder="プレースホルダー"
          />
          <span class="text-gray-500">値: {{ value2 }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-32">プレースホルダーのみ</span>
          <KtTextInput
            v-model="value3"
            placeholder="ここに入力"
          />
          <span class="text-gray-500">値: {{ value3 }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-32">非活性</span>
          <KtTextInput
            v-model="value4"
            placeholder="非活性"
            disabled
          />
          <span class="text-gray-500">値: {{ value4 }}</span>
        </div>
      </div>
    `,
  }),
};

export const interactionTemplate: StoryFn<Args> = (args) => ({
  components: { KtTextInput },
  setup() {
    const value = ref(args.modelValue || '');
    return { args, value };
  },
  template:
    '<KtTextInput v-model="value" v-bind="args" @update:modelValue="args[\'onUpdate:modelValue\']" />',
});

export const Interaction = interactionTemplate.bind({});
Interaction.args = {
  placeholder: 'テストプレースホルダー',
  'onUpdate:modelValue': fn(),
};

export const InteractionDisabled = interactionTemplate.bind({});
InteractionDisabled.args = {
  modelValue: '編集不可のテキスト',
  placeholder: 'テストプレースホルダー',
  disabled: true,
  'onUpdate:modelValue': fn(),
};

Interaction.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole('textbox') as HTMLInputElement;

  await step('テキストフィールドが表示される', async () => {
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'テストプレースホルダー');
    expect(input).toBeEnabled();
  });

  await step('テキストを入力できる', async () => {
    await userEvent.clear(input);
    await userEvent.type(input, 'Hello World');
    await waitFor(() => expect(input).toHaveValue('Hello World'));
  });

  await step('フォーカスがあたる', async () => {
    input.focus();
    expect(input).toHaveFocus();
  });

  await step('テキストをクリアできる', async () => {
    await userEvent.clear(input);
    await waitFor(() => expect(input).toHaveValue(''));
  });

  await step('特殊文字を入力できる', async () => {
    await userEvent.type(input, 'test@example.com');
    await waitFor(() => expect(input).toHaveValue('test@example.com'));
  });
};

InteractionDisabled.play = async ({ args, canvasElement, step }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole('textbox') as HTMLInputElement;

  await step('テキストフィールドが非活性状態で表示される', async () => {
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(input).toHaveValue('編集不可のテキスト');
  });

  await step('テキストを入力できない', async () => {
    const initialValue = input.value;
    await userEvent.type(input, 'New Text');
    await waitFor(() => expect(input).toHaveValue(initialValue));
    expect(args['onUpdate:modelValue']).not.toHaveBeenCalled();
  });

  await step('フォーカスが当たらない', async () => {
    input.focus();
    expect(input).not.toHaveFocus();
  });
};
