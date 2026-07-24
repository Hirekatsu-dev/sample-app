import { computed, ref } from 'vue';

export const useGlobalLoading = () => {
  const loadingCount = ref(0);
  const isLoading = computed(() => loadingCount.value > 0);

  const withLoading = async (content: () => Promise<void>) => {
    try {
      loadingCount.value += 1;
      await content();
    } finally {
      loadingCount.value -= 1;
    }
  };

  return {
    isLoading,
    withLoading,
  };
};
