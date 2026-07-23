<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  /**
   * セルの配置
   */
  align?: 'left' | 'center' | 'right';

  /**
   * 幅
   */
  width?: string;

  /**
   * 固定カラム
   */
  sticky?: 'left' | 'right';

  /**
   * 数値表示
   */
  numeric?: boolean;

  /**
   * クリック可能
   */
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  numeric: false,
  clickable: false,
});

const alignClasses = computed(() => {
  if (props.numeric) return 'text-right';

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
  return props.sticky === 'left'
    ? 'sticky left-0 z-10 bg-white'
    : 'sticky right-0 z-10 bg-white';
});

const cellClasses = computed(() => [
  'px-4 py-3 border-b border-gray-200 text-sm text-gray-900',
  alignClasses.value,
  stickyClasses.value,
  props.clickable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : '',
]);

const cellStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.width) {
    style.width = props.width;
  }
  return style;
});
</script>

<template>
  <td
    :class="cellClasses"
    :style="cellStyle"
    v-bind="$attrs"
  >
    <slot />
  </td>
</template>
