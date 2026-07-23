import type {
  ComponentPropsAndSlots,
  Meta,
  StoryObj,
} from '@storybook/vue3-vite';

import KtTable from './KtTable.vue';
import KtTableCell from './KtTableCell.vue';
import KtTableHeaderCell from './KtTableHeaderCell.vue';
import KtTableRow from './KtTableRow.vue';

type PagePropsAndCustomArgs = ComponentPropsAndSlots<typeof KtTable> & {
  rowCount?: number;
};

const meta = {
  component: KtTable,
  argTypes: {
    rowCount: {
      control: 'select',
      options: [0, 5, 20],
      description: 'テーブルに表示する行数',
    },
    isLoading: {
      control: 'boolean',
      description: 'ロード中かどうか',
    },
  },
  args: {
    rowCount: 5,
  },
} satisfies Meta<PagePropsAndCustomArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const basic: Story = {
  render: (args) => ({
    components: { KtTable, KtTableHeaderCell, KtTableRow, KtTableCell },
    setup() {
      const items = [...Array(5)].map((_elem, index) => ({
        id: index,
        name: 'サンプル太郎',
        age: 17,
      }));

      return { items, isLoading: args.isLoading };
    },
    template: `
    <KtTable
      :is-loading="isLoading"
      :is-empty="items.length === 0"
    >
      <template #header>
        <KtTableHeaderCell>
          名前
        </KtTableHeaderCell>
        <KtTableHeaderCell>
          年齢
        </KtTableHeaderCell>
      </template>
      <template #body>
        <KtTableRow
          v-for="item in items"
          :key="item.id"
        >
          <KtTableCell>
            {{ item.name }}
          </KtTableCell>
          <KtTableCell class="text-right">
            {{ item.age }}
          </KtTableCell>
        </KtTableRow>
      </template>
      <template #empty>
        <div class="w-full h-32">
        </div>
      </template>
    </KtTable>`,
  }),
  args: {
    isLoading: false,
    isEmpty: false,
  },
};
