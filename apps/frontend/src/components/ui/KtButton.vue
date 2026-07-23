<script lang="ts" setup>
import { computed } from 'vue';
import TestID from '../../test_util/data_testid';
import KtIcon from './KtIcon.vue';

interface Props {
  /**
   * アイコン
   */
  icon?: string;

  /**
   * アイコンの位置
   */
  iconPosition?: 'left' | 'right';

  /**
   * バリアント
   */
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'success'
    | 'warning'
    | 'error';

  /**
   * サイズ
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * ボタンタイプ
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * 非活性かどうか
   */
  disabled?: boolean;

  /**
   * 読み込み中かどうか
   */
  loading?: boolean;

  /**
   * 全幅かどうか
   */
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  iconPosition: 'left',
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'px-2 py-1 text-xs gap-1';
    case 'sm':
      return 'px-3 py-1.5 text-sm gap-1.5';
    case 'lg':
      return 'px-6 py-3.5 text-lg gap-2.5';
    case 'xl':
      return 'px-8 py-4.5 text-xl gap-3';
    default:
      return 'px-4 py-2.5 text-sm gap-2';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-primary text-white hover:bg-primary-light focus:ring-primary/20 border-primary';
    case 'outline':
      return 'bg-transparent text-ink border-ink/30 hover:bg-paper-alt hover:border-ink/60 focus:ring-ink/15';
    case 'ghost':
      return 'bg-transparent text-ink-secondary border-transparent hover:bg-paper-alt hover:text-ink focus:ring-ink/10';
    case 'success':
      return 'bg-success text-white hover:bg-success-dark focus:ring-success/20 border-success';
    case 'warning':
      return 'bg-warn text-white hover:bg-warn-dark focus:ring-warn/20 border-warn';
    case 'error':
      return 'bg-error text-white hover:bg-error-dark focus:ring-error/20 border-error';
    default:
      return 'bg-accent text-white hover:bg-accent-dark focus:ring-accent/20 border-accent';
  }
});

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150 ease-in-out',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
  sizeClasses.value,
  variantClasses.value,
  props.fullWidth ? 'w-full' : '',
]);

const iconSize = computed(() => {
  switch (props.size) {
    case 'xs':
      return 12;
    case 'sm':
      return 14;
    case 'lg':
      return 20;
    case 'xl':
      return 24;
    default:
      return 16;
  }
});

const isDisabled = computed(() => props.disabled || props.loading);
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="isDisabled"
    :data-testid="TestID.ktButton"
    v-bind="$attrs"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin"
      :style="{ width: `${iconSize}px`, height: `${iconSize}px` }"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Left icon -->
    <KtIcon
      v-else-if="icon && iconPosition === 'left'"
      :icon="icon"
      :size="iconSize"
    />

    <!-- Button text -->
    <span v-if="$slots.default">
      <slot />
    </span>

    <!-- Right icon -->
    <KtIcon
      v-if="icon && iconPosition === 'right' && !loading"
      :icon="icon"
      :size="iconSize"
    />
  </button>
</template>
