<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  /**
   * ロード中かどうか
   */
  isLoading?: boolean;

  /**
   * 空かどうか
   */
  isEmpty?: boolean;

  /**
   * テーブルサイズ
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * バリアント
   */
  variant?: 'default' | 'striped' | 'bordered';

  /**
   * ホバー効果
   */
  hoverable?: boolean;

  /**
   * 固定ヘッダー
   */
  stickyHeader?: boolean;

  /**
   * 最大高さ（スクロール用）
   */
  maxHeight?: string;

  /**
   * コンパクト表示
   */
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isEmpty: false,
  size: 'md',
  variant: 'default',
  hoverable: false,
  stickyHeader: false,
  compact: false,
});

const tableClasses = computed(() => [
  'w-full border-collapse',
  props.variant === 'bordered' ? 'border border-rule' : '',
]);

const containerClasses = computed(() => [
  'relative overflow-hidden rounded-lg',
  'border border-rule bg-white',
  props.variant === 'default' ? 'shadow-sm' : '',
  props.variant === 'striped' ? 'shadow-sm' : '',
  props.variant === 'bordered' ? 'shadow-sm' : '',
]);

const containerStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.maxHeight) {
    style.maxHeight = props.maxHeight;
    style.overflowY = 'auto';
  }

  return style;
});
</script>

<template>
  <div :class="containerClasses" :style="containerStyle">
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center"
    >
      <div v-if="$slots.loading">
        <slot name="loading" />
      </div>
      <div v-else class="flex items-center gap-2 text-ink-secondary">
        <svg class="animate-spin w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24">
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
        <span class="text-sm">読み込み中...</span>
      </div>
    </div>

    <!-- Table -->
    <table :class="tableClasses">
      <!-- Header -->
      <thead
        v-if="$slots.header"
        :class="[
          'bg-paper-alt border-b border-rule',
          stickyHeader ? 'sticky top-0 z-5' : ''
        ]"
      >
        <slot name="header" />
      </thead>

      <!-- Body -->
      <tbody
        v-if="$slots.body && !isEmpty"
        :class="[
          variant === 'striped' ? '[&>tr:nth-child(even)]:bg-paper-alt/60' : '',
          hoverable ? '[&>tr]:hover:bg-paper-alt/40 [&>tr]:transition-colors [&>tr]:duration-100' : '',
        ]"
      >
        <slot name="body" />
      </tbody>

      <!-- Footer -->
      <tfoot v-if="$slots.footer" class="bg-paper-alt border-t border-rule">
        <slot name="footer" />
      </tfoot>
    </table>

    <!-- Empty state -->
    <div
      v-if="isEmpty && !isLoading"
      class="p-10 text-center text-ink-muted"
    >
      <div v-if="$slots.empty">
        <slot name="empty" />
      </div>
      <div v-else>
        <svg class="w-10 h-10 mx-auto mb-3 text-rule" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-sm">データがありません</p>
      </div>
    </div>
  </div>
</template>
