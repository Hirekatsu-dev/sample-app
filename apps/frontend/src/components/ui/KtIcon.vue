<script lang="ts" setup>
import { useIcon } from '../../composables/use_icon';

const props = withDefaults(
  defineProps<{
    /** アイコン */
    icon: string;
    /** サイズ */
    size?: number;
  }>(),
  { size: 14 },
);

const path = useIcon(props.icon);
</script>

<template>
  <span
    :class="[
      'inline-block kt-icon',
    ]"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
    v-html="path"
  />
</template>

<style lang="scss">
.kt-icon svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
