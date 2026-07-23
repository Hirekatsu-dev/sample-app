<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  /**
   * セルの配置
   */
  align?: 'left' | 'center' | 'right';

  /**
   * ソート可能
   */
  sortable?: boolean;

  /**
   * ソート方向
   */
  sortDirection?: 'asc' | 'desc' | null;

  /**
   * 幅
   */
  width?: string;

  /**
   * 固定カラム
   */
  sticky?: 'left' | 'right';
}

interface Emits {
  /**
   * ソートクリック
   */
  sort: [];
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  sortable: false,
  sortDirection: null,
});

const emit = defineEmits<Emits>();

const alignClasses = computed(() => {
  switch (props.align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
});

const stickyClasses = computed(() => {
  if (!props.sticky) return '';
  return props.sticky === 'left' ? 'sticky left-0 z-10' : 'sticky right-0 z-10';
});

const cellClasses = computed(() => [
  'px-4 py-3 bg-gray-50 border-b border-gray-200',
  'text-sm font-semibold text-gray-900 tracking-wide uppercase',
  alignClasses.value,
  stickyClasses.value,
  props.sortable
    ? 'cursor-pointer hover:bg-gray-100 transition-colors select-none'
    : '',
]);

const cellStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.width) {
    style.width = props.width;
  }
  return style;
});

const handleSort = () => {
  if (props.sortable) {
    emit('sort');
  }
};
</script>

<template>
  <th
    :class="cellClasses"
    :style="cellStyle"
    @click="handleSort"
  >
    <div class="flex items-center gap-1">
      <span><slot /></span>

      <!-- ソートアイコン -->
      <div v-if="sortable" class="flex flex-col">
        <svg
          class="w-3 h-3"
          :class="sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
        </svg>
        <svg
          class="w-3 h-3 -mt-1"
          :class="sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  </th>
</template>
