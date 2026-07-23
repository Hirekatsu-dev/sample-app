export type Kbn = {
  id: string;
  name: string;
  values: KbnValue[];
};

export type KbnValue = {
  id: string;
  name: string;
};

// 定義を追加する際は `as const satisfies readonly Kbn[]` を付けて
// 区分値IDのリテラル型を保持する。
export const kbns: readonly Kbn[] = [];

// kbnsから区分値IDのunion型を抽出
export type KbnId = (typeof kbns)[number]['id'];
