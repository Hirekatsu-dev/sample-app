<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  modelValue: string | null | undefined;

  /**
   * 入力タイプ
   */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';

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
   * サイズバリエーション
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * バリアント
   */
  variant?: 'default' | 'error' | 'success';

  /**
   * オートコンプリート
   */
  autocomplete?: string;

  /**
   * 最大文字数
   */
  maxlength?: number;

  /**
   * ID属性
   */
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  size: 'md',
  variant: 'default',
  autocomplete: 'off',
});

const value = defineModel<string | null | undefined>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-2 text-sm';
    case 'lg':
      return 'px-4 py-3.5 text-base';
    default:
      return 'px-3.5 py-2.5 text-sm';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'error':
      return 'border-error focus:border-error focus:ring-error/15';
    case 'success':
      return 'border-success focus:border-success focus:ring-success/15';
    default:
      return 'border-rule focus:border-primary focus:ring-primary/15';
  }
});

const inputClasses = computed(() => [
  'block w-full rounded-lg border bg-white transition-all duration-150 ease-in-out',
  'text-ink placeholder-ink-muted',
  'focus:outline-none focus:ring-2',
  'disabled:bg-paper-alt disabled:text-ink-muted disabled:cursor-not-allowed',
  'read-only:bg-paper-alt read-only:cursor-default',
  sizeClasses.value,
  variantClasses.value,
]);
</script>

<template>
  <input
    :id="id"
    :type="type"
    :class="inputClasses"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :autocomplete="autocomplete"
    :maxlength="maxlength"
    v-model="value"
    v-bind="$attrs"
  />
</template>
