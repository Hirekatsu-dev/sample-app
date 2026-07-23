<script lang="ts" setup>
import { computed } from 'vue';
import KtIcon from './KtIcon.vue';

interface Props {
  /**
   * 表示するアイコン
   */
  icon: string;

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
   * ARIAラベル（アクセシビリティ）
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'p-1';
    case 'sm':
      return 'p-1.5';
    case 'lg':
      return 'p-3';
    case 'xl':
      return 'p-4';
    default:
      return 'p-2';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-300 border-gray-600';
    case 'outline':
      return 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 focus:ring-blue-200';
    case 'ghost':
      return 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 focus:ring-gray-200';
    case 'success':
      return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-300 border-green-600';
    case 'warning':
      return 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-300 border-yellow-500';
    case 'error':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 border-red-600';
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 border-blue-600';
  }
});

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center rounded-lg border transition-colors duration-200 ease-in-out',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  sizeClasses.value,
  variantClasses.value,
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
    :aria-label="ariaLabel"
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

    <!-- Icon -->
    <KtIcon
      v-else
      :icon="icon"
      :size="iconSize"
    />
  </button>
</template>
