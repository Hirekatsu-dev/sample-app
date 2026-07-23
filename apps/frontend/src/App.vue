<script lang="ts" setup>
import { onErrorCaptured } from 'vue';
import { ApiError } from '@/api/api_error';
import KtDialogContainer from '@/components/ui/KtDialogContainer.vue';
import KtToastContainer from '@/components/ui/KtToastContainer.vue';
import { provideRemoteApi } from '@/composables/use_api';
import { useToastMessages } from '@/composables/use_toast_messages';
import { logger } from '@/utils/logger';

provideRemoteApi();

const { addError } = useToastMessages();

onErrorCaptured((error) => {
  if (error instanceof ApiError) {
    addError(error.message);
  } else {
    addError('エラーが発生しました');
  }
  logger.error('Captured error:', error);
  return false;
});
</script>

<template>
  <main class="min-h-screen">
    <router-view />
  </main>

  <!-- グローバルダイアログコンテナ -->
  <KtDialogContainer />

  <!-- グローバルトーストコンテナ -->
  <KtToastContainer />
</template>
