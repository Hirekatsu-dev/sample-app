import type { Kbn } from '../../kbns/kbn';

export const buildFrontendKbnText = (kbns: Kbn[]) => {
  const content = [
    '// このファイルは generator/src/generators/kbns.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    'export const Kbn = {',
    ...kbns.map((k) => k.frontendDifinitionText),
    '} as const;',
    '',
    'export type KbnType<K extends keyof typeof Kbn> = typeof Kbn[K][keyof typeof Kbn[K]];',
    '',
  ].join('\n');

  return content;
};
