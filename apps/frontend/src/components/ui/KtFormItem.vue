<script lang="ts" setup>
import { computed, useId } from 'vue';

interface Props {
  /**
   * ラベルテキスト
   */
  label?: string;

  /**
   * 旧タイトルプロパティ（後方互換性）
   */
  title?: string;

  /**
   * 必須項目かどうか
   */
  required?: boolean;

  /**
   * 説明文
   */
  description?: string;

  /**
   * エラーメッセージ
   */
  errorMessage?: string;

  /**
   * 成功メッセージ
   */
  successMessage?: string;

  /**
   * レイアウト
   */
  layout?: 'vertical' | 'horizontal';

  /**
   * ラベル幅（horizontal時）
   */
  labelWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  layout: 'vertical',
  labelWidth: '140px',
});

const slots = defineSlots();

// 後方互換性のためtitleもlabelとして使用
const labelText = computed(() => props.label || props.title);

const hasError = computed(() => {
  return !!(props.errorMessage || slots.error);
});

const hasSuccess = computed(() => {
  return !!(props.successMessage || slots.success);
});

// アクセシビリティのためのID生成
const fieldId = useId();
const descriptionId = props.description ? `${fieldId}-description` : undefined;
const errorId = hasError.value ? `${fieldId}-error` : undefined;
</script>

<template>
  <div
    :class="[
      'form-item',
      layout === 'horizontal' ? 'form-item--horizontal' : 'form-item--vertical'
    ]"
  >
    <!-- ラベル部分 -->
    <label
      v-if="labelText || $slots.label"
      :for="fieldId"
      class="form-item__label"
      :class="{
        'form-item__label--required': required,
        'form-item__label--horizontal': layout === 'horizontal'
      }"
      :style="layout === 'horizontal' ? { minWidth: labelWidth } : {}"
    >
      <slot name="label">
        <span class="form-item__label-text">{{ labelText }}</span>
        <span v-if="required" class="form-item__required-mark" aria-label="必須">*</span>
      </slot>
    </label>

    <!-- フィールド部分 -->
    <div class="form-item__field">
      <!-- 説明文 -->
      <div
        v-if="description || $slots.description"
        :id="descriptionId"
        class="form-item__description"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </div>

      <!-- 入力フィールド -->
      <div
        class="form-item__input"
        :class="{
          'form-item__input--error': hasError,
          'form-item__input--success': hasSuccess && !hasError
        }"
      >
        <slot
          :fieldId="fieldId"
          :descriptionId="descriptionId"
          :errorId="errorId"
          :hasError="hasError"
        />
      </div>

      <!-- エラーメッセージ -->
      <div
        v-if="hasError"
        :id="errorId"
        class="form-item__error"
        role="alert"
        aria-live="polite"
      >
        <slot name="error">
          <div class="flex items-start gap-1.5">
            <svg class="w-3.5 h-3.5 mt-0.5 text-error flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span class="text-error text-xs">{{ errorMessage }}</span>
          </div>
        </slot>
      </div>

      <!-- 成功メッセージ -->
      <div
        v-else-if="hasSuccess"
        class="form-item__success"
        role="status"
        aria-live="polite"
      >
        <slot name="success">
          <div class="flex items-start gap-1.5">
            <svg class="w-3.5 h-3.5 mt-0.5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-success text-xs">{{ successMessage }}</span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-item {
  @apply space-y-1.5;

  &--horizontal {
    @apply flex items-start space-y-0 space-x-4;
  }
}

.form-item__label {
  @apply block font-medium text-ink-secondary text-sm;

  &--required {
    @apply flex items-center gap-1;
  }

  &--horizontal {
    @apply pt-2.5 flex-shrink-0;
  }
}

.form-item__label-text {
  @apply block;
}

.form-item__required-mark {
  @apply text-accent text-sm font-normal;
}

.form-item__field {
  @apply space-y-1.5 flex-1;
}

.form-item__description {
  @apply text-xs text-ink-muted;
}

.form-item__input {
  // エラー・成功状態での子要素のスタイリング
  &--error {
    :deep(input),
    :deep(textarea),
    :deep(select) {
      @apply border-error focus:border-error;
    }
  }

  &--success {
    :deep(input),
    :deep(textarea),
    :deep(select) {
      @apply border-success focus:border-success;
    }
  }
}

.form-item__error {
  @apply mt-1;
}

.form-item__success {
  @apply mt-1;
}
</style>
