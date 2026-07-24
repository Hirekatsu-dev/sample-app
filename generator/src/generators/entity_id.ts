import { entityIds } from '../seed/entity_ids';
import { buildRustEntityIdsText } from './builders/backend/entity_id';
import { appTargets } from './targets';
import { clear, render } from './util';

/*
# アプリケーションで扱うエンティティのIDに関するコードを生成する
エンティティIDはアプリケーション固有のため、ターゲットごとの定義から生成する。
## 生成物一覧
- {backendRoot}/src/model/id.rs
  - RustのエンティティID定義
*/

const reset = () => {
  for (const target of appTargets) {
    clear(`${target.backendRoot}/src/model/id.rs`);
  }
};

export const generateEntityIds = () => {
  reset();

  for (const target of appTargets) {
    render(
      buildRustEntityIdsText(entityIds[target.key]),
      `${target.backendRoot}/src/model/id.rs`,
    );
  }
};
