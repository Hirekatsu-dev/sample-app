<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  /**
   * カードのタイトル
   */
  title?: string;

  /**
   * フッターテキスト
   */
  footer?: string;

  /**
   * シャドウの種類
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  /**
   * バリアント
   */
  variant?: 'default' | 'outline' | 'elevated' | 'flat';

  /**
   * サイズ
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * ボーダー半径
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

  /**
   * ヘッダーのバリアント
   */
  headerVariant?: 'default' | 'primary' | 'secondary' | 'transparent';

  /**
   * フッターのバリアント
   */
  footerVariant?: 'default' | 'primary' | 'secondary' | 'transparent';

  /**
   * ホバー効果
   */
  hoverable?: boolean;

  /**
   * クリック可能
   */
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'md',
  variant: 'default',
  size: 'md',
  rounded: 'lg',
  headerVariant: 'primary',
  footerVariant: 'primary',
  hoverable: false,
  clickable: false,
});

const shadowClasses = computed(() => {
  if (props.shadow === 'none') return '';

  switch (props.shadow) {
    case 'sm':
      return 'shadow-sm';
    case 'lg':
      return 'shadow-lg';
    case 'xl':
      return 'shadow-xl';
    case '2xl':
      return 'shadow-2xl';
    default:
      return 'shadow-md';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'outline':
      return 'border-2 border-rule bg-white';
    case 'elevated':
      return 'border border-rule/60 bg-white';
    case 'flat':
      return 'bg-paper-alt border border-rule';
    default:
      return 'border border-rule bg-white';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'p-3';
    case 'lg':
      return 'p-6';
    default:
      return 'p-4';
  }
});

const roundedClasses = computed(() => {
  switch (props.rounded) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-sm';
    case 'md':
      return 'rounded-md';
    case 'xl':
      return 'rounded-xl';
    case '2xl':
      return 'rounded-2xl';
    case 'full':
      return 'rounded-full';
    default:
      return 'rounded-lg';
  }
});

const headerVariantClasses = computed(() => {
  switch (props.headerVariant) {
    case 'secondary':
      return 'bg-paper-alt text-ink border-b border-rule';
    case 'transparent':
      return 'bg-transparent text-ink border-b border-rule';
    case 'default':
      return 'bg-paper-alt text-ink border-b border-rule';
    default:
      return 'bg-primary text-white border-b-0';
  }
});

const footerVariantClasses = computed(() => {
  switch (props.footerVariant) {
    case 'secondary':
      return 'bg-paper-alt text-ink-secondary border-t border-rule';
    case 'transparent':
      return 'bg-transparent text-ink-secondary border-t border-rule';
    case 'default':
      return 'bg-paper-alt text-ink-secondary border-t border-rule';
    default:
      return 'bg-primary text-white border-t-0';
  }
});

const cardClasses = computed(() => [
  'overflow-hidden transition-all duration-200 ease-in-out',
  variantClasses.value,
  shadowClasses.value,
  roundedClasses.value,
  props.hoverable || props.clickable
    ? 'hover:shadow-lg transform hover:-translate-y-0.5'
    : '',
  props.clickable ? 'cursor-pointer select-none' : '',
]);
</script>

<template>
  <div
    :class="cardClasses"
    @click="clickable ? $emit('click', $event) : undefined"
  >
    <!-- ヘッダー -->
    <div
      v-if="title || $slots.header"
      :class="[
        'px-6 py-4',
        headerVariantClasses,
        rounded === 'none' ? '' : 'rounded-t-lg'
      ]"
    >
      <slot name="header">
        <h2 v-if="title" class="text-base font-semibold">
          {{ title }}
        </h2>
      </slot>
    </div>

    <!-- コンテンツ -->
    <div :class="['px-6', sizeClasses]">
      <slot />
    </div>

    <!-- フッター -->
    <div
      v-if="footer || $slots.footer"
      :class="[
        'px-6 py-4',
        footerVariantClasses,
        rounded === 'none' ? '' : 'rounded-b-lg'
      ]"
    >
      <slot name="footer">
        <p v-if="footer" class="text-sm">{{ footer }}</p>
      </slot>
    </div>
  </div>
</template>
