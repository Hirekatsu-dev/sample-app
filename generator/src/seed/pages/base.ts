import type { KbnId } from '../kbns';
import type { baseAdminPages, baseMemberPages } from '.';

/**
 * ページ固有の属性定義（ナビゲーションを含まない）
 */
export type PageDef = {
  /** ページ物理名（PascalCase）例: "Login", "Problems" */
  pname: string;
  /** ページ論理名（日本語）例: "ログイン画面", "問題一覧画面" */
  lname?: string;
  /** URLパス 例: "/login", "/problems/:id" */
  path: string;
  /** 画面の説明 */
  description?: string;
  /** 認証が必要か */
  requiresAuth?: boolean;
  /** 使用するAPI */
  apis?: PageApi[];
  /** パスパラメータ */
  pathParams?: PathParam[];
  /** クエリパラメータ */
  queryParams?: QueryParam[];
  /**
   * Vue Routerのネストルートとして描画する子ページ。
   * このページのEntryPointは<router-view>を持つレイアウトになる。
   * 概念的なグループ化には使用しない。
   */
  children?: PageDef[];
  /**
   * 子ページにカスタムコンテキストをscoped slot経由で渡すか。
   * trueの場合、EntryPointが v-slot="{ customContext }" で受け取り
   * <router-view :parent-context="customContext" /> で子に渡す。
   * 子EntryPointはProfilePageCustomContext型を親Pageファイルからimportしてpropsで受け取る。
   * childrenを持つページにのみ意味を持つ。
   */
  passesCustomContext?: boolean;
};

/**
 * ナビゲーション付きの完全なページ定義
 */
export type Page<TPageName extends string = string> = PageDef & {
  /** 遷移先ページ */
  navigations?: PageNavigation<TPageName>[];
};

/**
 * ページで使用するAPI定義
 */
export type PageApi = {
  /** APIエンドポイントのoperationId */
  operationId: string;
  /** この画面でのAPI用途 */
  description?: string;
};

/**
 * ページ遷移定義
 */
export type PageNavigation<TPageName extends string = string> = {
  /** 遷移先ページ名 */
  to: TPageName;
  /** 遷移リンクのラベル */
  label?: string;
  /** 遷移条件の説明 */
  condition?: string;
};

/**
 * パスパラメータ定義
 */
export type PathParam = {
  /** パラメータ名 */
  name: string;
  /** パラメータの型 */
  type: 'string' | 'id';
  /** ID型の場合のエンティティID */
  entityId?: string;
  /** 説明 */
  description?: string;
};

/**
 * クエリパラメータ定義
 */
export type QueryParam = {
  /** パラメータ名 */
  name: string;
  /** パラメータの型 */
  type: 'string' | 'number' | 'boolean' | KbnId;
  /** 配列かどうか */
  isArray?: boolean;
  /** 必須かどうか */
  required?: boolean;
  /** 説明 */
  description?: string;
};

/**
 * ページ固有の属性を定義するヘルパー関数。リテラル型を保持するためジェネリクスを使用。
 */
export function definePageDef<const T extends PageDef>(page: T): T {
  return page;
}

/**
 * ページ定義にナビゲーションを付与するヘルパー関数。
 * 型の循環参照を避けるため `TPageName extends string` にし、
 * index.ts の `satisfies readonly Page<PageName>[]` で不正なページ名を検出する。
 */
export function withNavigations<
  const T extends PageDef,
  const TPageName extends string,
>(
  page: T,
  navs: PageNavigation<TPageName>[],
): T & { navigations: PageNavigation<TPageName>[] } {
  return { ...page, navigations: navs };
}

type ExtractNames<T extends readonly PageDef[]> =
  | T[number]['pname']
  | (T[number] extends infer E
      ? E extends { children: infer C extends readonly PageDef[] }
        ? ExtractNames<C>
        : never
      : never);

export type MemberPageName = ExtractNames<typeof baseMemberPages>;
export type AdminPageName = ExtractNames<typeof baseAdminPages>;

export type PageName = MemberPageName | AdminPageName;
