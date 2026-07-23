import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { useIconMap } from '../../composables/use_icon';
import KtIcon from './KtIcon.vue';

type Story = StoryObj<typeof KtIcon>;

const meta: Meta<typeof KtIcon> = {
  component: KtIcon,
};

export default meta;

export const basic: Story = {
  render: () => ({
    components: { KtIcon },
    setup() {
      const iconMap = useIconMap();
      const icons = Object.keys(iconMap).sort();

      return {
        icons,
      };
    },
    template: `
        <div class="flex flex-col space-y-2">
          <div v-for="icon in icons" :key="icon" class="flex items-center space-x-2">
            <span class="w-64"> {{ icon }} </span>
            <KtIcon
              :icon="icon"
              :size="24"
            />
            <KtIcon
              :icon="icon"
              :size="24"
              class="bg-primary text-white"
            />
          </div>
        </div>
      `,
  }),
};
