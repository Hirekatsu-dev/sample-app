import type { Kbn } from '../../kbns/kbn';

export const buildApiKbnText = (kbns: Kbn[]) => {
  const content = [
    '// このファイルは generator/src/generators/kbns.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    '#[allow(unused_imports)]',
    'use serde::{Deserialize, Serialize};',
    '',
    ...kbns.map((k) => `${k.backendDifinitionText}\n`),
  ].join('\n');

  return content;
};
