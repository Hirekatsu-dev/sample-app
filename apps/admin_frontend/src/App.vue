<script lang="ts" setup>
import { onErrorCaptured } from 'vue';
import { provideRemoteApi } from '@/composables/use_api';
import { logger } from '@/utils/logger';

provideRemoteApi();

onErrorCaptured((error) => {
  logger.error('Captured error:', error);
  return false;
});
</script>

<template>
  <main class="min-h-screen">
    <router-view />
  </main>
</template>
