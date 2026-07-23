// APIエンドポイントの型定義

import type { MemberApiSchemaNames } from '@seed/api_schemas/types';
import type { MemberApiErrorName } from '@seed/errors';
import type { EntityId } from '../entity_ids';

// Member APIのスキーマ名のユニオン型を生成

type MemberApiEmptyResponse = {
  type: 'empty';
};

type MemberApiIdResponse = {
  type: 'id';
  entityId: EntityId;
};

type MemberApiResponseListItemSchema = {
  type: 'list';
  itemSchema: MemberApiSchemaNames;
};

type MemberApiResponseDataSchema = {
  type: 'data';
  dataSchema: MemberApiSchemaNames;
};

type MemberApiErrorResponse = {
  name: MemberApiErrorName;
  description?: string;
  dataSchema?: MemberApiSchemaNames;
};

export type MemberResponseBodySchema =
  | MemberApiEmptyResponse
  | MemberApiIdResponse
  | MemberApiResponseListItemSchema
  | MemberApiResponseDataSchema;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  operationId: string;
  summary: string;
  description?: string;
  tags?: string[];
  pathParameters?: ApiPathParameter[];
  queryParameters?: ApiQueryParameters;
  requestBody?: {
    required: boolean;
    schema: MemberApiSchemaNames;
  };
  successResponse: MemberResponseBodySchema;
  errorResponses: MemberApiErrorResponse[];
  security?: string[]; // セキュリティスキーム名
  cookieResponse?: boolean; // true のとき、ハンドラーが CookieJar を受け取り (CookieJar, Json<...>) を返す
}

// パスパラメータの型定義（IDや文字列のみ）
export interface ApiPathParameter {
  name: string;
  type: 'string';
  format?: 'uuid';
  entityId?: EntityId;
  description?: string;
  example?: string;
}

// クエリパラメータの型定義（事前定義されたスキーマのみ）
export interface ApiQueryParameters {
  schema: MemberApiSchemaNames;
  description?: string;
}

export interface ApiEndpointGroup {
  name: string;
  basePath: string;
  description?: string;
  endpoints?: ApiEndpoint[];
  subEndpointGroups?: Record<string, ApiEndpointGroup>;
}
