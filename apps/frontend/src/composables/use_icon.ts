import { computed, type MaybeRef, unref } from 'vue';

const ICON_MAP: Record<string, string> = {};

function getFileNameAndExtension(filePath: string): {
  name: string;
  extension: string;
} {
  const fileNameWithExtension = filePath.split('/').pop() || '';
  const lastDotIndex = fileNameWithExtension.lastIndexOf('.');

  if (lastDotIndex === -1) {
    return { name: fileNameWithExtension, extension: '' }; // 拡張子がない場合
  }

  const name = fileNameWithExtension.slice(0, lastDotIndex);
  const extension = fileNameWithExtension.slice(lastDotIndex + 1);
  return { name, extension };
}

export function registerDefaultIcons() {
  const files = import.meta.glob<true, string, string>('/src/assets/**/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  });

  for (const key in files) {
    const { name, extension } = getFileNameAndExtension(key);

    if (extension.toLowerCase() === 'svg') {
      ICON_MAP[name] = files[key];
    }
  }
}

export function useIconMap() {
  return ICON_MAP;
}

export function useIcon(icon: MaybeRef<string>) {
  const path = computed(() => ICON_MAP[unref(icon)]);

  if (!path.value) {
    throw new Error(`icon ${icon} does not registered.`);
  }

  return path;
}
