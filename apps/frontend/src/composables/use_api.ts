import { type InjectionKey, inject, markRaw, provide } from 'vue';
import { type IApi, MockApi, RemoteApi } from '../api/api';

const API_INJECTION_KEY: InjectionKey<IApi> = Symbol('api');

export function provideRemoteApi(): IApi {
  const api = markRaw(new RemoteApi());
  provide(API_INJECTION_KEY, api);

  return api;
}

export function provideMockApi(mock: Partial<IApi>): IApi {
  const api = markRaw(new MockApi(mock));
  provide(API_INJECTION_KEY, api);

  return api;
}

export function useApi(): IApi {
  const api = inject(API_INJECTION_KEY);

  if (!api) {
    throw new Error(
      'API: `useAPI`は`provideRemoteApi`を実行してから呼んでください。',
    );
  }

  return api;
}
