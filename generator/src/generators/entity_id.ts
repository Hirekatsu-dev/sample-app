import { entityIds } from '../seed/entity_ids';
import { buildRustEntityIdsText } from './builders/backend/entity_id';
import { clear, render } from './util';

/*
# アプリケーションで扱うエンティティのIDに関するコードを生成する
## 生成物一覧
- apps/api/src/model/id.rs
  - RustのApiスキーマ定義
*/

const reset = () => {
  clear('apps/api/src/model/id.rs');
};

export const generateEntityIds = () => {
  reset();

  render(buildRustEntityIdsText(entityIds), 'apps/api/src/model/id.rs');
};
