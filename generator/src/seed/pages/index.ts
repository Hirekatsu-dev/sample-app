import type { Page, PageDef, PageName } from './base';
import { homePage } from './definitions/home';

export * from './base';

export const basePages = [homePage] as const satisfies readonly PageDef[];

// 型注釈による検証: navigations[].to が有効な PageName でない場合コンパイルエラーになる。
// satisfies を直接 basePages に使うと PageName が循環参照になるためここで分離している。
export const pages: readonly Page<PageName>[] = basePages;
