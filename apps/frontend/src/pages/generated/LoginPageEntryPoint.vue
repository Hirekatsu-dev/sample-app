<script setup lang="ts">
/**
 * このファイルは generator/src/generators/pages.ts から生成されます。
 * 直接編集しないでください。
 */

import { useRouter } from 'vue-router';
import type { IApi } from '@/api/api';
import { useApi } from '@/composables/use_api';
import LoginPage from '@/pages/inner/LoginPage.vue';

export interface LoginPageContext {
  apis: LoginPageApis;
  navigations: LoginPageNavigations;
}

export type LoginPageApis = {
  /** ログイン処理 */
  login: IApi['login'];
  /** ログイン後のユーザー情報取得 */
  getMe: IApi['getMe'];
};

export type LoginPageNavigations = {
  /** ホームへ */
  toHome: () => void;
};

const api = useApi();
const router = useRouter();

const apis: LoginPageApis = {
  login: api.login.bind(api),
  getMe: api.getMe.bind(api),
};

const navigations: LoginPageNavigations = {
  toHome: () => router.push({ name: 'Home' }),
};

const context: LoginPageContext = {
  apis,
  navigations,
};
</script>

<template>
  <LoginPage :context="context" />
</template>
