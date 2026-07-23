import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { ApiErrorCode } from '@/error_code';
import { logger } from '@/utils/logger';
import { ApiError } from './api_error';
import type {
  ApiDataResponse,
  ApiErrorResponse,
  ApiListResponse,
  ApiResponse,
} from './api_response';
import { mapKeysCamelCase, mapKeysSnakeCase } from './convert_keys';

const baseUrl =
  window.location.origin === 'http://localhost:8080'
    ? 'http://localhost:3000'
    : '';

export class BaseApi {
  private readonly axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: baseUrl,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.axios.interceptors.request.use(
      (config) => {
        if (config.data) {
          config.data = mapKeysSnakeCase(config.data);
        }

        if (config.params) {
          config.params = mapKeysSnakeCase(config.params);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.axios.interceptors.response.use(
      (response) => {
        const { data } = response;
        const convertedData = mapKeysCamelCase(data);
        return { ...response, data: convertedData };
      },
      (error) => {
        logger.error('API response error:', error);
        return Promise.reject(error);
      },
    );
  }

  private async executeRequest<D extends ApiResponse>(
    config: AxiosRequestConfig,
  ) {
    let response: AxiosResponse<D>;
    try {
      response = await this.axios.request<D>(config);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data as ApiErrorResponse | undefined;
        throw new ApiError(
          this.getErrorMessage(data?.errorCode),
          error.response.status,
          data?.errorCode,
        );
      }
      throw new ApiError(
        'ネットワークエラーが発生しました。通信状況を確認してください。',
      );
    }

    this.validateResponse(response);

    return response;
  }

  private validateResponse<D extends ApiResponse>(response: AxiosResponse<D>) {
    const data = response.data as unknown as ApiErrorResponse | undefined;
    if (data && 'errorCode' in data) {
      throw new ApiError(
        this.getErrorMessage(data.errorCode),
        response.status,
        data.errorCode,
      );
    }
  }

  private getErrorMessage(resultCode?: string): string {
    switch (resultCode) {
      case ApiErrorCode.InvalidParameter:
        return 'パラメータが不正です。';
      case ApiErrorCode.LoginFailure:
        return 'ログインに失敗しました。';
      case ApiErrorCode.NotFound:
        return 'データが見つかりませんでした。';
      case ApiErrorCode.SessionExpired:
        return 'セッションが失効しました。再度ログインしてください。';
      default:
        return '不明なエラーが発生しました。';
    }
  }

  protected async requestEmpty(config: AxiosRequestConfig) {
    await this.executeRequest<ApiResponse>(config);
  }

  protected async requestGetData<T>(config: AxiosRequestConfig) {
    const response = await this.executeRequest<ApiDataResponse<T>>(config);

    return response.data;
  }

  protected async requestGetList<T>(config: AxiosRequestConfig) {
    const response = await this.executeRequest<ApiListResponse<T>>(config);

    return response.data;
  }
}
