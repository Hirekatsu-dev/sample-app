import type { AdminPageName, MemberPageName, Page, PageDef } from './base';
import { adminHomePage } from './definitions/admin_home';
import { homePage } from './definitions/home';
import { loginPage } from './definitions/login';

export * from './base';

// 画面はアプリケーションごとに定義する。
// member は apps/frontend、admin は apps/admin_frontend へ生成される。
export const baseMemberPages = [
  loginPage,
  homePage,
] as const satisfies readonly PageDef[];

export const baseAdminPages = [
  adminHomePage,
] as const satisfies readonly PageDef[];

// 型注釈による検証: navigations[].to が有効な PageName でない場合コンパイルエラーになる。
// satisfies を直接 base*Pages に使うと PageName が循環参照になるためここで分離している。
export const memberPages: readonly Page<MemberPageName>[] = baseMemberPages;
export const adminPages: readonly Page<AdminPageName>[] = baseAdminPages;

export const pages = {
  member: memberPages,
  admin: adminPages,
} as const;
