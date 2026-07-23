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
    httpStatusCode: 'NOT_FOUND',
    pname: 'NotFound',
    lname: 'データが見つからない',
    errorCode: 'E0004',
    message: 'データが見つかりませんでした。',
  },
] as const satisfies ApiErrorCode[];
