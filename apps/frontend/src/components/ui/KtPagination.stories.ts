import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import TestID from '../../test_util/data_testid';
import KtPagination from './KtPagination.vue';

type Args = ComponentProps<typeof KtPagination> & {
  'onUpdate:currentPage'?: (page: number) => void;
  'onPage-change'?: (page: number) => void;
};

type Story = StoryObj<Args>;

const meta: Meta<Args> = {
  component: KtPagination,
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
    },
    totalItems: {
      control: { type: 'number', min: 0 },
    },
    itemsPerPage: {
      control: { type: 'number', min: 1 },
    },
    maxVisiblePages: {
      control: { type: 'number', min: 3, max: 15 },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;

// 基本的な使用例
export const Basic: Story = {
  render: (args) => ({
    components: { KtPagination },
    setup() {
      const currentPage = ref(args.currentPage || 1);

      const handlePageChange = (page: number) => {
        currentPage.value = page;
        args['onUpdate:currentPage']?.(page);
        args['onPage-change']?.(page);
      };

      return {
        args: { ...args, currentPage },
        handlePageChange,
      };
    },
    template: `
      <div class="space-y-4">
        <div class="text-sm text-gray-600">現在のページ: {{ args.currentPage }}</div>
        <KtPagination
          v-bind="args"
          @update:currentPage="handlePageChange"
          @page-change="handlePageChange"
        />
      </div>
    `,
  }),
  args: {
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
    maxVisiblePages: 7,
    disabled: false,
    'onUpdate:currentPage': fn(),
    'onPage-change': fn(),
  },
};

// 様々なデータ量のパターン
export const VariousDataSizes: Story = {
  render: (args) => ({
    components: { KtPagination },
    setup() {
      const scenarios = [
        {
          label: 'データなし',
          totalItems: 0,
          itemsPerPage: 10,
          currentPage: 1,
        },
        {
          label: '少ないデータ (1ページ)',
          totalItems: 5,
          itemsPerPage: 10,
          currentPage: 1,
        },
        {
          label: '中程度のデータ (5ページ)',
          totalItems: 50,
          itemsPerPage: 10,
          currentPage: 3,
        },
        {
          label: '大量のデータ (100ページ)',
          totalItems: 1000,
          itemsPerPage: 10,
          currentPage: 50,
        },
      ];

      const currentPages = ref(scenarios.map((s) => s.currentPage));

      const handlePageChange = (index: number, page: number) => {
        currentPages.value[index] = page;
      };

      return {
        args,
        scenarios,
        currentPages,
        handlePageChange,
      };
    },
    template: `
      <div class="space-y-8">
        <div
          v-for="(scenario, index) in scenarios"
          :key="scenario.label"
          class="space-y-2"
        >
          <h3 class="text-lg font-semibold">{{ scenario.label }}</h3>
          <div class="text-sm text-gray-600">現在のページ: {{ currentPages[index] }}</div>
          <KtPagination
            :current-page="currentPages[index]"
            :total-items="scenario.totalItems"
            :items-per-page="scenario.itemsPerPage"
            :max-visible-pages="args.maxVisiblePages || 7"
            :disabled="args.disabled || false"
            @update:currentPage="(page) => handlePageChange(index, page)"
          />
        </div>
      </div>
    `,
  }),
  args: {
    maxVisiblePages: 7,
    disabled: false,
  },
};

// 無効状態
export const Disabled: Story = {
  render: (args) => ({
    components: { KtPagination },
    setup() {
      return { args };
    },
    template: '<KtPagination v-bind="args" />',
  }),
  args: {
    currentPage: 5,
    totalItems: 100,
    itemsPerPage: 10,
    maxVisiblePages: 7,
    disabled: true,
  },
};

// 表示ページ数の違い
export const DifferentVisiblePages: Story = {
  render: (args) => ({
    components: { KtPagination },
    setup() {
      const visiblePageOptions = [3, 5, 7, 11];
      const currentPages = ref(visiblePageOptions.map(() => 25));

      const handlePageChange = (index: number, page: number) => {
        currentPages.value[index] = page;
      };

      return {
        args,
        visiblePageOptions,
        currentPages,
        handlePageChange,
      };
    },
    template: `
      <div class="space-y-8">
        <div
          v-for="(maxPages, index) in visiblePageOptions"
          :key="maxPages"
          class="space-y-2"
        >
          <h3 class="text-lg font-semibold">最大表示ページ数: {{ maxPages }}</h3>
          <div class="text-sm text-gray-600">現在のページ: {{ currentPages[index] }}</div>
          <KtPagination
            :current-page="currentPages[index]"
            :total-items="500"
            :items-per-page="10"
            :max-visible-pages="maxPages"
            @update:currentPage="(page) => handlePageChange(index, page)"
          />
        </div>
      </div>
    `,
  }),
};

// インタラクションテスト用
export const interactionTemplate: StoryFn<Args> = (args) => ({
  components: { KtPagination },
  setup() {
    return { args };
  },
  template: '<KtPagination v-bind="args" />',
});

export const interaction = interactionTemplate.bind({});
interaction.args = {
  currentPage: 5,
  totalItems: 100,
  itemsPerPage: 10,
  maxVisiblePages: 7,
  disabled: false,
  'onUpdate:currentPage': fn(),
  'onPage-change': fn(),
};

export const interactionDisabled = interactionTemplate.bind({});
interactionDisabled.args = {
  currentPage: 5,
  totalItems: 100,
  itemsPerPage: 10,
  maxVisiblePages: 7,
  disabled: true,
  'onUpdate:currentPage': fn(),
  'onPage-change': fn(),
};

interaction.play = async ({ args, canvasElement, step }) => {
  const canvas = within(canvasElement);

  await step('ページネーションが正しく表示される', async () => {
    const container = canvas.getByTestId(TestID.ktPagination.container);
    expect(container).toBeInTheDocument();

    const info = canvas.getByTestId(TestID.ktPagination.info);
    expect(info).toHaveTextContent('100 件中 41 - 50 件を表示');
  });

  await step('前へボタンをクリックしてページが変更される', async () => {
    const prevButton = canvas.getByTestId(TestID.ktPagination.prevButton);
    expect(prevButton).toBeEnabled();

    await userEvent.click(prevButton);
    await waitFor(() => {
      expect(args['onUpdate:currentPage']).toHaveBeenCalledWith(4);
      expect(args['onPage-change']).toHaveBeenCalledWith(4);
    });
  });

  await step('ページ番号ボタンをクリックしてページが変更される', async () => {
    const pageButtons = canvas.getAllByTestId(TestID.ktPagination.pageButton);
    const targetButton = pageButtons.find(
      (button) => button.textContent === '3',
    );
    expect(targetButton).toBeDefined();

    if (targetButton) {
      await userEvent.click(targetButton);
      await waitFor(() => {
        expect(args['onUpdate:currentPage']).toHaveBeenCalledWith(3);
        expect(args['onPage-change']).toHaveBeenCalledWith(3);
      });
    }
  });

  await step('次へボタンをクリックしてページが変更される', async () => {
    const nextButton = canvas.getByTestId(TestID.ktPagination.nextButton);
    expect(nextButton).toBeEnabled();

    await userEvent.click(nextButton);
    await waitFor(() => {
      expect(args['onUpdate:currentPage']).toHaveBeenLastCalledWith(6);
      expect(args['onPage-change']).toHaveBeenLastCalledWith(6);
    });
  });
};

interactionDisabled.play = async ({ args, canvasElement, step }) => {
  const canvas = within(canvasElement);

  await step('無効状態でページネーションが表示される', async () => {
    const container = canvas.getByTestId(TestID.ktPagination.container);
    expect(container).toBeInTheDocument();

    const info = canvas.getByTestId(TestID.ktPagination.info);
    expect(info).toHaveTextContent('100 件中 41 - 50 件を表示');
  });

  await step('すべてのボタンが無効状態になっている', async () => {
    const prevButton = canvas.getByTestId(TestID.ktPagination.prevButton);
    expect(prevButton).toBeDisabled();

    const nextButton = canvas.getByTestId(TestID.ktPagination.nextButton);
    expect(nextButton).toBeDisabled();

    const pageButtons = canvas.getAllByTestId(TestID.ktPagination.pageButton);
    pageButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  await step(
    '無効状態のボタンをクリックしてもイベントが発火しない',
    async () => {
      const prevButton = canvas.getByTestId(TestID.ktPagination.prevButton);
      await userEvent.click(prevButton);

      const nextButton = canvas.getByTestId(TestID.ktPagination.nextButton);
      await userEvent.click(nextButton);

      const pageButtons = canvas.getAllByTestId(TestID.ktPagination.pageButton);
      if (pageButtons[0]) {
        await userEvent.click(pageButtons[0]);
      }

      await waitFor(() => {
        expect(args['onUpdate:currentPage']).not.toHaveBeenCalled();
        expect(args['onPage-change']).not.toHaveBeenCalled();
      });
    },
  );
};
