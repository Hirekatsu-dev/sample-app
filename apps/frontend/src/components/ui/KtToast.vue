<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import TestID from '@/test_util/data_testid';

const props = withDefaults(
  defineProps<{
    /** トーストメッセージ */
    message: string;
    /** トースト種別 */
    type?: 'info' | 'success' | 'warning' | 'error';
    /** 自動非表示までの時間（ms）。nullの場合は手動で削除 */
    timeout: number | null;
  }>(),
  { type: 'info' },
);

// Emits の定義
const emit = defineEmits(['close']);

// トーストを閉じる関数
const visible = ref(true);
const closeToast = () => {
  visible.value = false;
  emit('close');
};

// タイムアウトの処理
let timer: ReturnType<typeof setTimeout> | null = null;
onMounted(() => {
  if (props.timeout !== null) {
    timer = setTimeout(() => {
      closeToast();
    }, props.timeout);
  }
});

// コンポーネントが破棄される際にタイマーをクリア
onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<template>
  <div
    v-if="visible"
    :data-testid="TestID.ktToast"
    :class="[
      'flex items-center justify-between gap-4 p-4 rounded shadow-lg text-white',
      'transition-opacity duration-300 ease-in-out',
      type === 'info' && 'bg-blue-500',
      type === 'success' && 'bg-green-500',
      type === 'warning' && 'bg-yellow-500',
      type === 'error' && 'bg-red-500',
    ]"
  >
    <!-- メッセージ -->
    <p class="flex-grow">{{ message }}</p>

    <!-- ×ボタン (timeout が null の場合のみ表示) -->
    <button
      v-if="timeout === null"
      :data-testid="TestID.ktToastButton"
      class="text-white hover:text-gray-200 focus:outline-none"
      @click="closeToast"
      aria-label="Close Toast"
    >
      ×
    </button>
  </div>
</template>
