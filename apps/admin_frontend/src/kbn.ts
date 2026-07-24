// このファイルは generator/src/generators/kbns.ts から生成されます。
// 直接編集しないでください。

export const Kbn = {
} as const;

export type KbnType<K extends keyof typeof Kbn> = typeof Kbn[K][keyof typeof Kbn[K]];
