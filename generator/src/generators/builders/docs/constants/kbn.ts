import type { Kbn } from '../../../kbns/kbn';

export const buildMarkdownKbnText = (kbns: Kbn[]) => {
  const content = [
    '<!-- このファイルは generator/src/generators/kbns.ts から生成されます。 -->',
    '<!-- 直接編集しないでください。 -->',
    '',
    '# 区分一覧',
    '',
    ...kbns.map((k) => `${k.markdownText}\n`),
  ].join('\n');

  return content;
};
