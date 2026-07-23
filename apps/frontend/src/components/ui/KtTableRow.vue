<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  /**
   * 選択されているか
   */
  selected?: boolean;

  /**
   * ホバー効果
   */
  hoverable?: boolean;

  /**
   * クリック可能
   */
  clickable?: boolean;

  /**
   * 無効状態
   */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  hoverable: true,
  clickable: false,
  disabled: false,
});

const rowClasses = computed(() => [
  'transition-colors duration-150',
  props.selected ? 'bg-blue-50 border-blue-200' : '',
  props.hoverable && !props.disabled ? 'hover:bg-gray-50' : '',
  props.clickable && !props.disabled ? 'cursor-pointer select-none' : '',
  props.disabled ? 'opacity-50' : '',
]);
</script>

<template>
  <tr
    :class="rowClasses"
    v-bind="$attrs"
  >
    <slot />
  </tr>
</template>
