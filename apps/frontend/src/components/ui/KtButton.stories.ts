import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import TestID from '../../test_util/data_testid';
import KtButton from './KtButton.vue';

type Args = ComponentProps<typeof KtButton> & {
  onClick?: () => void;
};

type Story = StoryObj<Args>;

const meta: Meta<Args> = {
  component: KtButton,
};

export const variation: Story = {
  render: (args) => ({
    components: { KtButton },
    setup() {
      const variants = [
        'primary',
        'success',
        'warn',
        'error',
        'primary-outline',
        'success-outline',
        'warn-outline',
        'error-outline',
      ];

      const value = ref(0);
      const onClick = () => {
        value.value += 1;
      };
      return { args, variants, value, onClick };
    },
    template: `
      <div class="flex flex-col space-y-2">
        <p> value: {{ value }}</p>
        <div
          v-for="variant in variants"
          class="flex space-x-2"
          :key="variant"
        >
          <span class="w-32" v-text="variant" />
          <KtButton
            :variant="variant"
            @click="onClick"
            v-bind="args"
          >
            ボタン
          </KtButton>
          <KtButton
            :variant="variant"
            disabled
            @click="onClick"
            v-bind="args"
          >
            ボタン
          </KtButton>
          <KtButton
            :variant="variant"
            icon="search"
            @click="onClick"
            v-bind="args"
          >
            ボタン
          </KtButton>
          <KtButton
            :variant="variant"
            icon="search"
            disabled
            @click="onClick"
            v-bind="args"
          >
            ボタン
          </KtButton>
        </div>
      </div>
    `,
  }),
};

export default meta;

export const interactionTemplate: StoryFn<Args> = (args) => ({
  components: { KtButton },
  setup() {
    return { args };
  },
  template: '<KtButton v-bind="args" @click="onClick">Click Me</KtButton>',
});

export const interaction = interactionTemplate.bind({});
interaction.args = {
  onClick: fn(),
};

export const interactionDisabled = interactionTemplate.bind({});
interactionDisabled.args = {
  disabled: true,
  onClick: fn(),
};

interaction.play = async ({ args, canvasElement, step }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByTestId(TestID.ktButton);

  await step('ボタンが活性状態で表示される', async () => {
    expect(button).toHaveTextContent('Click Me');
    expect(button).toBeEnabled();
  });

  await step('ボタンをクリックできる', async () => {
    await userEvent.click(button);
    await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(1));
  });

  await step('フォーカスがあたる', async () => {
    button.focus();
    expect(button).toHaveFocus();
  });

  await step('フォーカス+Enterキーで操作できる', async () => {
    button.focus();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(2));
  });

  await step('フォーカス+Spaceキーで操作できる', async () => {
    button.focus();

    await userEvent.keyboard('{ }');
    await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(3));
  });
};

interactionDisabled.play = async ({ args, canvasElement, step }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByTestId(TestID.ktButton);

  await step('ボタンが非活性状態で表示される', async () => {
    expect(button).toHaveTextContent('Click Me');
    expect(button).toBeDisabled();
  });

  await step('ボタンをクリックしても何も起こらない', async () => {
    await userEvent.click(button);
    await waitFor(() => expect(args.onClick).not.toHaveBeenCalled());
  });

  await step('ボタンにフォーカスが当たらない', async () => {
    button.focus();
    expect(button).not.toHaveFocus();
  });
};
