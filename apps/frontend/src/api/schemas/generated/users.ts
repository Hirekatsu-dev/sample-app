// このファイルは generator/src/generators/api_schemas.ts から生成されます。
// 直接編集しないでください。

// biome-ignore lint/correctness/noUnusedImports: 自動生成コードのため使用しないこともある
import type { KbnType } from "@/kbn";

/** ログイン中のユーザー情報 */
export interface GetMeResponseData {
  /** ユーザーID */
  id: string;
  /** 表示名 */
  name: string;
  /** メールアドレス */
  email: string;
}
