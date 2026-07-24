<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useApi } from '@/composables/use_api';
import { useGlobalLoading } from '@/composables/use_global_loading';
import type { AdminHomePageContext } from '../generated/AdminHomePageEntryPoint.vue';

defineProps<{
  context: AdminHomePageContext;
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
      <h1 class="text-3xl font-bold mb-2">sample-app 管理画面</h1>
      <p class="text-gray-600">
        管理者向けのアプリケーションです。メンバー画面とは別のアプリケーションとして動作します。
      </p>
    </div>

    <div class="max-w-md rounded border border-rule bg-white p-6">
      <h2 class="text-lg font-semibold mb-2">ヘルスチェック</h2>
      <p class="text-gray-600">管理APIとデータベースの疎通状況を表示します。</p>

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

      <button
        type="button"
        class="mt-4 rounded bg-primary px-4 py-2 text-white disabled:bg-disabled"
        :disabled="isLoading"
        @click="checkHealth"
      >
        再確認
      </button>
    </div>
  </div>
</template>
