<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  modelValue: string | null | undefined;

  /**
   * プレースホルダー
   */
  placeholder?: string;

  /**
   * 非活性にするかどうか
   */
  disabled?: boolean;

  /**
   * 読み取り専用かどうか
   */
  readonly?: boolean;

  /**
   * 必須項目かどうか
   */
  required?: boolean;

  /**
   * 行数
   */
  rows?: number;

  /**
   * カラム数
   */
  cols?: number;

  /**
   * サイズバリエーション
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * バリアント
   */
  variant?: 'default' | 'error' | 'success';

  /**
   * リサイズ可能性
   */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';

  /**
   * 最大文字数
   */
  maxlength?: number;

  /**
   * ID属性
   */
  id?: string;

  /**
   * オートコンプリート
   */
  autocomplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  required: false,
  rows: 4,
  size: 'md',
  variant: 'default',
  resize: 'vertical',
  autocomplete: 'off',
});

const value = defineModel<string | null | undefined>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-2 text-sm';
    case 'lg':
      return 'px-4 py-4 text-lg';
    default:
      return 'px-4 py-3 text-base';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'error':
      return 'border-red-500 focus:border-red-500 focus:ring-red-200';
    case 'success':
      return 'border-green-500 focus:border-green-500 focus:ring-green-200';
    default:
      return 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';
  }
});

const textareaClasses = computed(() => [
  'block w-full rounded-lg border transition-colors duration-200 ease-in-out',
  'placeholder-gray-500 focus:outline-none focus:ring-2',
  'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
  'readonly:bg-gray-50 readonly:cursor-default',
  sizeClasses.value,
  variantClasses.value,
]);

const resizeStyle = computed(() => {
  return { resize: props.resize };
});
</script>

<template>
  <textarea
    :id="id"
    :class="textareaClasses"
    :style="resizeStyle"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :rows="rows"
    :cols="cols"
    :maxlength="maxlength"
    :autocomplete="autocomplete"
    v-model="value"
    v-bind="$attrs"
  />
</template>
