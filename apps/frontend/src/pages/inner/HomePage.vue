<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import KtButton from '@/components/ui/KtButton.vue';
import KtCard from '@/components/ui/KtCard.vue';
import { useApi } from '@/composables/use_api';
import { useGlobalLoading } from '@/composables/use_global_loading';
import type { HomePageContext } from '../generated/HomePageEntryPoint.vue';

const props = defineProps<{
  context: HomePageContext;
}>();

type HealthStatus = 'unknown' | 'healthy' | 'unhealthy';

const goToLogin = () => props.context.navigations.toLogin();

// ヘルスチェックは generator を通さない custom エンドポイントのため、
// context 経由ではなく useApi() から直接呼び出す。
const api = useApi();
const { isLoading, withLoading } = useGlobalLoading();

const status = ref<HealthStatus>('unknown');

// 判定印の表示。テスト結果と同じ語彙で状態を示す。
const stampLabel = computed(() => {
  if (isLoading.value) return 'CHECKING';
  switch (status.value) {
    case 'healthy':
      return 'PASS';
    case 'unhealthy':
      return 'FAIL';
    default:
      return 'NOT RUN';
  }
});

const stampColor = computed(() => {
  if (isLoading.value) return 'text-ink-muted';
  switch (status.value) {
    case 'healthy':
      return 'text-success';
    case 'unhealthy':
      return 'text-error';
    default:
      return 'text-ink-muted';
  }
});

const checkHealth = async () => {
  await withLoading(async () => {
    try {
      await api.getHealthCheck();
      status.value = 'healthy';
    } catch {
      status.value = 'unhealthy';
    }
  });
};

onMounted(checkHealth);
</script>

<template>
  <div class="max-w-page animate-fade-in mx-auto px-4 py-10 sm:px-6">
    <div class="mb-8">
      <p
        class="mb-2 font-mono text-xs font-semibold tracking-[0.18em] text-ink-muted"
      >
        TEST MANAGEMENT
      </p>
      <h1 class="mb-2 text-3xl font-bold tracking-tight">sample-app</h1>
      <p class="text-ink-secondary">
        テストケースを登録し、実行結果を記録します。
      </p>
    </div>

    <KtCard
      title="ヘルスチェック"
      class="max-w-md"
    >
      <p class="text-ink-secondary">APIとデータベースの疎通を確認します。</p>

      <div class="mt-4 flex items-center gap-3 border-t border-rule pt-4">
        <span class="font-mono text-xs tracking-wider text-ink-muted"
          >RESULT</span
        >
        <span
          class="stamp"
          :class="stampColor"
          aria-live="polite"
          >{{ stampLabel }}</span
        >
      </div>

      <template #footer>
        <KtButton
          :disabled="isLoading"
          @click="checkHealth"
          >再確認</KtButton
        >
      </template>
    </KtCard>

    <div class="max-w-md mt-6">
      <KtButton
        variant="outline"
        @click="goToLogin"
        >ログインへ</KtButton
      >
    </div>
  </div>
</template>
