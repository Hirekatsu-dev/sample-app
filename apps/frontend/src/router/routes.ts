import type { RouteRecordRaw } from 'vue-router';
// 自動生成されたルートとRoutes定数をインポート
import { Routes as GeneratedRoutes, generatedRoutes } from './generated/routes';

// 生成されたRoutes定数を再エクスポート（カスタムルートを追加）
export const Routes = Object.freeze({
  ...GeneratedRoutes,
  // 自動生成されていないルート名があればここに追加
});

// カスタムルート（自動生成されていないもの）
const customRoutes: Array<RouteRecordRaw> = [
  // 404ページ（最後に配置）
  {
    path: '/:path(.*)*',
    redirect: { name: Routes.Home },
  },
];

// 自動生成されたルートとカスタムルートを結合
export const routes: Array<RouteRecordRaw> = [
  ...generatedRoutes,
  ...customRoutes,
];
