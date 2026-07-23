import { memberApiErrors } from './difinitions/member';

export type ApiErrorCode = {
  pname: string;
  lname: string;
  message: string;
  httpStatusCode: string;
  errorCode: string;
};

export const errors = {
  member: memberApiErrors,
};

export type MemberApiErrorName = (typeof memberApiErrors)[number]['lname'];
