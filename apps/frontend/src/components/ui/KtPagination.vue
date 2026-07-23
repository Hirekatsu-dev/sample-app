<script lang="ts" setup>
import { computed } from 'vue';
import TestID from '../../test_util/data_testid';

interface Props {
  /**
   * 現在のページ番号 (1から始まる)
   */
  currentPage: number;

  /**
   * 総アイテム数
   */
  totalItems: number;

  /**
   * 1ページあたりのアイテム数
   */
  itemsPerPage: number;

  /**
   * 表示するページ番号の最大数
   */
  maxVisiblePages?: number;

  /**
   * 無効状態かどうか
   */
  disabled?: boolean;
}

interface Emits {
  /**
   * ページが変更されたときのイベント
   */
  'update:currentPage': [page: number];

  /**
   * ページが変更されたときのイベント (alias)
   */
  'page-change': [page: number];
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 7,
  disabled: false,
});

const emit = defineEmits<Emits>();

// 総ページ数を計算
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage);
});

// 表示するページ番号の配列を計算
const visiblePages = computed(() => {
  const current = props.currentPage;
  const total = totalPages.value;
  const max = props.maxVisiblePages;

  if (total <= max) {
    // 総ページ数が最大表示数以下の場合、すべてのページを表示
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + max - 1);

  // 終端に合わせて開始位置を調整
  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// 前のページに移動可能かどうか
const canGoPrevious = computed(() => {
  return props.currentPage > 1 && !props.disabled;
});

// 次のページに移動可能かどうか
const canGoNext = computed(() => {
  return props.currentPage < totalPages.value && !props.disabled;
});

// 開始位置に省略記号を表示するかどうか
const showStartEllipsis = computed(() => {
  const pages = visiblePages.value;
  return pages.length > 0 && pages[0] > 1;
});

// 終了位置に省略記号を表示するかどうか
const showEndEllipsis = computed(() => {
  const pages = visiblePages.value;
  return pages.length > 0 && pages[pages.length - 1] < totalPages.value;
});

// 表示範囲の情報
const rangeInfo = computed(() => {
  if (props.totalItems === 0) {
    return '0 件中 0 件を表示';
  }

  const start = (props.currentPage - 1) * props.itemsPerPage + 1;
  const end = Math.min(
    props.currentPage * props.itemsPerPage,
    props.totalItems,
  );

  return `${props.totalItems} 件中 ${start} - ${end} 件を表示`;
});

// ページ変更ハンドラー
const changePage = (page: number) => {
  if (
    props.disabled ||
    page < 1 ||
    page > totalPages.value ||
    page === props.currentPage
  ) {
    return;
  }

  emit('update:currentPage', page);
  emit('page-change', page);
};

// 前のページに移動
const goToPrevious = () => {
  changePage(props.currentPage - 1);
};

// 次のページに移動
const goToNext = () => {
  changePage(props.currentPage + 1);
};

// 最初のページに移動
const goToFirst = () => {
  changePage(1);
};

// 最後のページに移動
const goToLast = () => {
  changePage(totalPages.value);
};
</script>

<template>
  <div
    v-if="totalPages > 0"
    class="flex flex-col gap-3 items-center md:flex-row md:justify-between"
    :data-testid="TestID.ktPagination.container"
  >
    <!-- 表示範囲の情報 -->
    <div
      class="text-gray-600 text-sm"
      :data-testid="TestID.ktPagination.info"
    >
      {{ rangeInfo }}
    </div>

    <!-- ページネーションコントロール -->
    <div class="flex gap-1 items-center flex-wrap">
      <!-- 前のページボタン -->
      <button
        type="button"
        class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canGoPrevious"
        :data-testid="TestID.ktPagination.prevButton"
        @click="goToPrevious"
      >
        前へ
      </button>

      <!-- 最初のページ（省略記号がある場合） -->
      <template v-if="showStartEllipsis">
        <button
          type="button"
          class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled"
          :data-testid="TestID.ktPagination.pageButton"
          @click="goToFirst"
        >
          1
        </button>
        <span
          class="px-2 py-1 text-gray-600 text-sm flex items-center"
          :data-testid="TestID.ktPagination.ellipsis"
        >
          ...
        </span>
      </template>

      <!-- ページ番号ボタン -->
      <button
        v-for="page in visiblePages"
        :key="`page-${page}`"
        type="button"
        class="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="page === currentPage
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-gray-300'"
        :disabled="disabled"
        :data-testid="TestID.ktPagination.pageButton"
        @click="changePage(page)"
      >
        {{ page }}
      </button>

      <!-- 最後のページ（省略記号がある場合） -->
      <template v-if="showEndEllipsis">
        <span
          class="px-2 py-1 text-gray-600 text-sm flex items-center"
          :data-testid="TestID.ktPagination.ellipsis"
        >
          ...
        </span>
        <button
          type="button"
          class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled"
          :data-testid="TestID.ktPagination.pageButton"
          @click="goToLast"
        >
          {{ totalPages }}
        </button>
      </template>

      <!-- 次のページボタン -->
      <button
        type="button"
        class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canGoNext"
        :data-testid="TestID.ktPagination.nextButton"
        @click="goToNext"
      >
        次へ
      </button>
    </div>
  </div>
</template>