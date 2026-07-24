<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
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

const statusLabel = computed(() => {
  if (isLoading.value) return '確認中';
  switch (status.value) {
    case 'healthy':
      return '正常';
    case 'unhealthy':
      return '応答なし';
    default:
      return '未確認';
  }
});

const statusColor = computed(() => {
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
  <div class="bg-blueprint-grid min-h-screen">
    <!-- 管理画面であることを常時示す。メンバー画面との取り違えを防ぐ -->
    <header class="border-b border-rule bg-ink">
      <div
        class="max-w-page mx-auto flex items-baseline gap-3 px-6 py-3 sm:px-8"
      >
        <span
          class="font-mono text-xs font-semibold tracking-[0.25em] text-accent-light"
          >ADMIN</span
        >
        <span class="font-mono text-xs tracking-wide text-paper-alt"
          >sample-app 管理コンソール</span
        >
      </div>
    </header>

    <main class="max-w-page animate-fade-in mx-auto px-6 py-12 sm:px-8">
      <h1 class="text-3xl font-semibold tracking-tight">
        ワークスペースとユーザーを管理する
      </h1>
      <p class="mt-3 max-w-2xl text-ink-secondary">
        管理者向けのアプリケーションです。メンバー画面とは別のアプリケーションとして動作します。
      </p>

      <section class="mt-10 max-w-xl border border-rule bg-paper">
        <h2
          class="border-b border-rule px-5 py-3 font-mono text-xs font-semibold tracking-[0.18em] text-ink-secondary"
        >
          HEALTH CHECK
        </h2>

        <div class="px-5 py-5">
          <p class="text-sm text-ink-secondary">
            管理APIとデータベースの疎通を確認します。
          </p>

          <dl class="mt-4 flex items-baseline gap-4 border-t border-rule pt-4">
            <dt class="font-mono text-xs tracking-wider text-ink-muted">
              STATUS
            </dt>
            <dd
              class="font-mono text-2xl font-semibold"
              :class="statusColor"
              aria-live="polite"
            >
              {{ statusLabel }}
            </dd>
          </dl>

          <button
            type="button"
            class="mt-5 bg-accent px-4 py-2 font-mono text-xs font-semibold tracking-wider text-white transition-colors hover:bg-accent-dark disabled:bg-disabled"
            :disabled="isLoading"
            @click="checkHealth"
          >
            再確認
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
