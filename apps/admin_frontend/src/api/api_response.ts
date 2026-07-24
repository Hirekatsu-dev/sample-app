// biome-ignore lint/complexity/noBannedTypes: マーカー型として使用
export type ApiResponse = {};

export interface ApiErrorResponse extends ApiResponse {
  errorCode: string;
  data?: object;
}

export interface ApiDataResponse<T> extends ApiResponse {
  data: T;
}

export interface ApiListResponse<T> extends ApiResponse {
  list: T[];
  count: number;
}

export type IdResponse = {
  id: string;
};
