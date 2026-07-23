import { computed, ref } from 'vue';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timeout?: number | null;
}

const toastMessages = ref<ToastMessage[]>([]);

let toastIdCounter = 0;

export const useToastMessages = () => {
  const messages = computed(() => toastMessages.value);

  const addToast = (
    message: string,
    type: ToastMessage['type'] = 'info',
    timeout: number | null = 5000,
  ) => {
    const id = `toast-${++toastIdCounter}`;
    const toast: ToastMessage = {
      id,
      message,
      type,
      timeout,
    };

    toastMessages.value.push(toast);
    return id;
  };

  const removeToast = (id: string) => {
    const index = toastMessages.value.findIndex((toast) => toast.id === id);
    if (index !== -1) {
      toastMessages.value.splice(index, 1);
    }
  };

  const clearAll = () => {
    toastMessages.value = [];
  };

  // 便利メソッド
  const addSuccess = (message: string, timeout?: number | null) =>
    addToast(message, 'success', timeout);

  const addError = (message: string, timeout?: number | null) =>
    addToast(message, 'error', timeout);

  const addWarning = (message: string, timeout?: number | null) =>
    addToast(message, 'warning', timeout);

  const addInfo = (message: string, timeout?: number | null) =>
    addToast(message, 'info', timeout);

  return {
    messages,
    addToast,
    removeToast,
    clearAll,
    addSuccess,
    addError,
    addWarning,
    addInfo,
  };
};
