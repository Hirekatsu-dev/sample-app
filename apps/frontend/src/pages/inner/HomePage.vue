<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import KtButton from '@/components/ui/KtButton.vue';
import KtCard from '@/components/ui/KtCard.vue';
import { useApi } from '@/composables/use_api';
import { useGlobalLoading } from '@/composables/use_global_loading';
import type { HomePageContext } from '../generated/HomePageEntryPoint.vue';

defineProps<{
  context: HomePageContext;
}>();

type HealthStatus = 'unknown' | 'healthy' | 'unhealthy';

// ヘルスチェックは generator を通さない custom エンドポイントのため、
// context 経由ではなく useApi() から直接呼び出す。
const api = useApi();
const { isLoading, withLoading } = useGlobalLoading();

const status = ref<HealthStatus>('unknown');

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
  <div class="max-w-page mx-auto px-4 sm:px-6 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">sample-app</h1>
      <p class="text-gray-600">
        コードレビュー支援サービスの試運転用サンプルです。
      </p>
    </div>

    <KtCard
      title="ヘルスチェック"
      class="max-w-md"
    >
      <p class="text-gray-600">APIとデータベースの疎通状況を表示します。</p>

      <p class="mt-2 text-lg font-semibold">
        <span v-if="isLoading">確認中...</span>
        <span
          v-else-if="status === 'healthy'"
          class="text-success"
          >正常</span
        >
        <span
          v-else-if="status === 'unhealthy'"
          class="text-error"
          >異常</span
        >
        <span v-else>未確認</span>
      </p>

      <template #footer>
        <KtButton
          :disabled="isLoading"
          @click="checkHealth"
          >再確認</KtButton
        >
      </template>
    </KtCard>
  </div>
</template>
