// カスタムAPI実装
// 生成されたAPIを拡張して、追加のビジネスロジックを実装

import {
  GeneratedApi,
  GeneratedMockApi,
  type IGeneratedApi,
} from './generated_api';

// 生成されたAPIインターフェースを拡張
export interface IApi extends IGeneratedApi {
  // カスタムのエンドポイントがあればここに追加
  // 既存のエンドポイントでも上書きが可能
  /** ヘルスチェック（APIサーバーからデータベースへの疎通確認） */
  getHealthCheck(): Promise<void>;
}

export class RemoteApi extends GeneratedApi implements IApi {
  // カスタムのエンドポイントや、自動生成されたエンドポイントの上書きがあればここに追加
  public async getHealthCheck(): Promise<void> {
    await this.requestEmpty({
      method: 'get',
      url: 'api/health/db',
    });
  }
}

export class MockApi extends GeneratedMockApi implements IApi {
  // カスタムのエンドポイントのモック実装があればここに追加
  getHealthCheck: () => Promise<void>;

  constructor(mock: Partial<IApi>) {
    super(mock);

    this.getHealthCheck =
      mock.getHealthCheck ??
      (() => Promise.reject(new Error('実装してください。')));
  }
}
