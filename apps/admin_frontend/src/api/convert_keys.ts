import {
  camelCase,
  isArray,
  isObject,
  mapKeys,
  mapValues,
  snakeCase,
} from 'lodash';

const mapKeysDeep = (
  // biome-ignore lint/suspicious/noExplicitAny: APIレスポンスの動的な構造を変換するため、任意の型を受け入れる必要がある
  data: any,
  // biome-ignore lint/suspicious/noExplicitAny: コールバック関数は任意の値と鍵に対して動作する汎用的な変換関数である
  callback: (value: any, key: any) => string,
  // biome-ignore lint/suspicious/noExplicitAny: 戻り値も入力データと同様に任意の構造を保持する
): any => {
  if (isArray(data)) {
    return data.map((innerData) => mapKeysDeep(innerData, callback));
  }

  if (isObject(data)) {
    return mapValues(mapKeys(data, callback), (val) =>
      mapKeysDeep(val, callback),
    );
  }

  return data;
};

// biome-ignore lint/suspicious/noExplicitAny: APIレスポンスデータの構造が動的なため、anyを使用してキー変換を行う
export const mapKeysCamelCase = (data: any) =>
  mapKeysDeep(data, (_value, key) => camelCase(key));

// biome-ignore lint/suspicious/noExplicitAny: APIリクエストデータの構造が動的なため、anyを使用してキー変換を行う
export const mapKeysSnakeCase = (data: any) =>
  mapKeysDeep(data, (_value, key) => snakeCase(key));
