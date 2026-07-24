import { adminApiErrors } from './difinitions/admin';
import { memberApiErrors } from './difinitions/member';

export type ApiErrorCode = {
  pname: string;
  lname: string;
  message: string;
  httpStatusCode: string;
  errorCode: string;
};

// エラーコードはアプリケーションごとに定義する。
// member は apps/api・apps/frontend、admin は apps/admin_api・apps/admin_frontend へ生成される。
export const errors = {
  member: memberApiErrors,
  admin: adminApiErrors,
};

export type MemberApiErrorName = (typeof memberApiErrors)[number]['lname'];
export type AdminApiErrorName = (typeof adminApiErrors)[number]['lname'];
