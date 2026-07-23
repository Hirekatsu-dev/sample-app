import type { Meta, StoryObj } from '@storybook/vue3-vite';
import KtIconButton from './KtIconButton.vue';

type Story = StoryObj<typeof KtIconButton>;

const meta: Meta<typeof KtIconButton> = {
  component: KtIconButton,
};

export default meta;

export const basic: Story = {
  render: () => ({
    components: { KtIconButton },
    setup() {
      const variants = ['primary', 'success', 'warn', 'error'];
      return { variants };
    },
    template: `
      <div class="flex flex-col space-y-2">
        <div
          v-for="variant in variants"
          class="flex space-x-2"
          :key="variant"
        >
          <span class="w-32" v-text="variant" />
          <KtIconButton
            icon="search"
            :variant="variant"
            v-bind="args"
          >
            {{ args.default }}
          </KtIconButton>
          <KtIconButton
            icon="search"
            :variant="variant"
            disabled
            v-bind="args"
          >
            {{ args.default }}
          </KtIconButton>
        </div>
      </div>
      `,
  }),
};
