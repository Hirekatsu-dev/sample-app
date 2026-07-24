// このファイルは generator/src/generators/api_endpoints.ts から生成されます。
// 直接編集しないでください。

import { BaseApi } from './api_base';
import type {
  ApiDataResponse,
  ApiListResponse,
  IdResponse,
} from './api_response';
import type { GetMeResponseData, PostLoginRequestParams, PostLoginResponseData } from './schemas/generated_schemas';

export interface IGeneratedApi {
  login(data: PostLoginRequestParams): Promise<ApiDataResponse<PostLoginResponseData>>;
  logout(): Promise<void>;
  getMe(): Promise<ApiDataResponse<GetMeResponseData>>;
}

export class GeneratedApi extends BaseApi implements IGeneratedApi {
  public async login(data: PostLoginRequestParams) {
    return await this.requestGetData<PostLoginResponseData>({
      method: 'post',
      url: `/api/auth/login`,
      data,
    });
  }
  public async logout() {
    return await this.requestEmpty({
      method: 'post',
      url: `/api/auth/logout`,
    });
  }
  public async getMe() {
    return await this.requestGetData<GetMeResponseData>({
      method: 'get',
      url: `/api/v1/users/me`,
    });
  }
}

const notImplementedResponse = async () => {
  throw new Error('実装してください。');
};

export class GeneratedMockApi extends BaseApi implements IGeneratedApi {
  login: (data: PostLoginRequestParams) => Promise<ApiDataResponse<PostLoginResponseData>>;
  logout: () => Promise<void>;
  getMe: () => Promise<ApiDataResponse<GetMeResponseData>>;

  constructor(mock: Partial<IGeneratedApi>) {
    super();

    this.login = mock.login ?? notImplementedResponse;
    this.logout = mock.logout ?? notImplementedResponse;
    this.getMe = mock.getMe ?? notImplementedResponse;
  }
}
