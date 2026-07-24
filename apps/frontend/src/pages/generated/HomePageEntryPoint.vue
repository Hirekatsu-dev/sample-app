<script setup lang="ts">
/**
 * このファイルは generator/src/generators/pages.ts から生成されます。
 * 直接編集しないでください。
 */

import { useRouter } from 'vue-router';
import HomePage from '@/pages/inner/HomePage.vue';

export interface HomePageContext {
  navigations: HomePageNavigations;
}

export type HomePageNavigations = {
  /** ログイン */
  toLogin: () => void;
};

const router = useRouter();

const navigations: HomePageNavigations = {
  toLogin: () => router.push({ name: 'Login' }),
};

const context: HomePageContext = {
  navigations,
};
</script>

<template>
  <HomePage :context="context" />
</template>
