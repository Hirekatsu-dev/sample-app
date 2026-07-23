import type { ApiErrorCode } from '..';

export const memberApiErrors = [
  {
    httpStatusCode: 'INTERNAL_SERVER_ERROR',
    pname: 'Unknown',
    lname: '不明なエラー',
    errorCode: 'E0001',
    message: '不明なエラーが発生しました。',
  },
  {
    httpStatusCode: 'BAD_REQUEST',
    pname: 'InvalidParameter',
    lname: 'パラメータ不正',
    errorCode: 'E0002',
    message: 'パラメータが不正です。',
  },
  {
    httpStatusCode: 'UNAUTHORIZED',
    pname: 'LoginFailure',
    lname: 'ログイン失敗',
    errorCode: 'E0003',
    message: 'ログインに失敗しました。',
  },
  {
    httpStatusCode: 'NOT_FOUND',
    pname: 'NotFound',
    lname: 'データが見つからない',
    errorCode: 'E0004',
    message: 'データが見つかりませんでした。',
  },
  {
    httpStatusCode: 'UNAUTHORIZED',
    pname: 'SessionExpired',
    lname: 'セッション失効',
    errorCode: 'E0005',
    message: 'セッションが失効しました。',
  },
] as const satisfies ApiErrorCode[];
