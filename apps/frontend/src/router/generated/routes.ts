/**
 * このファイルは generator/src/generators/pages.ts から生成されます。
 * 直接編集しないでください。
 */
import type { RouteRecordRaw } from 'vue-router';

import HomePageEntryPoint from '@/pages/generated/HomePageEntryPoint.vue';

/**
 * ルート名の定数
 */
export const Routes = Object.freeze({
  Home: 'Home',
});

/**
 * 自動生成されたルート定義
 * カスタムルート（レイアウト、リダイレクトなど）は router/routes.ts で追加してください
 */
export const generatedRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: Routes.Home,
    component: HomePageEntryPoint,
  },
];
