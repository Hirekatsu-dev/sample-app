/**
 * このファイルは generator/src/generators/pages.ts から生成されます。
 * 直接編集しないでください。
 */
import type { RouteRecordRaw } from 'vue-router';

import AdminHomePageEntryPoint from '@/pages/generated/AdminHomePageEntryPoint.vue';

/**
 * ルート名の定数
 */
export const Routes = Object.freeze({
  AdminHome: 'AdminHome',
});

/**
 * 自動生成されたルート定義
 * カスタムルート（レイアウト、リダイレクトなど）は router/routes.ts で追加してください
 */
export const generatedRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: Routes.AdminHome,
    component: AdminHomePageEntryPoint,
  },
];
