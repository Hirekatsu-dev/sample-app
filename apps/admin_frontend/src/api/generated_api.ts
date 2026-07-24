// このファイルは generator/src/generators/api_endpoints.ts から生成されます。
// 直接編集しないでください。

import { BaseApi } from './api_base';
import type {
  ApiDataResponse,
  ApiListResponse,
  IdResponse,
} from './api_response';


export interface IGeneratedApi {
}

export class GeneratedApi extends BaseApi implements IGeneratedApi {
}

const notImplementedResponse = async () => {
  throw new Error('実装してください。');
};

export class GeneratedMockApi extends BaseApi implements IGeneratedApi {

  constructor(mock: Partial<IGeneratedApi>) {
    super();

  }
}
