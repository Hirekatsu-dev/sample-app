// このファイルは generator/src/generators/api_schemas.ts から生成されます。
// 直接編集しないでください。

// biome-ignore lint/correctness/noUnusedImports: 自動生成コードのため使用しないこともある
import type { KbnType } from "@/kbn";

/** ログインパラメータ */
export interface PostLoginRequestParams {
  /** メールアドレス */
  email: string;
  /** パスワード */
  password: string;
}

/** ログインレスポンス */
export interface PostLoginResponseData {
  /** ユーザーID */
  userId: string;
}
