<script setup lang="ts">
import { useDialog } from '@/composables/use_dialog';
import KtButton from './KtButton.vue';

const { dialogs } = useDialog();

const handleAction = (dialogId: number, action: string) => {
  const dialog = dialogs.value.find((d) => d.id === dialogId);
  if (dialog) {
    dialog.resolve(action);
  }
};

const handleOverlayClick = (dialogId: number) => {
  const dialog = dialogs.value.find((d) => d.id === dialogId);
  if (dialog?.options.closeOnOverlayClick && dialog.options.closeAction) {
    dialog.resolve(dialog.options.closeAction);
  }
};

const handleKeydown = (event: KeyboardEvent, dialogId: number) => {
  if (event.key === 'Escape') {
    const dialog = dialogs.value.find((d) => d.id === dialogId);
    if (dialog?.options.closeAction) {
      dialog.resolve(dialog.options.closeAction);
    }
  }
};
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="dialog">
      <div
        v-for="(dialog, index) in dialogs"
        :key="dialog.id"
        class="fixed inset-0 flex items-center justify-center"
        :style="{ zIndex: 1000 + index }"
        @keydown="handleKeydown($event, dialog.id)"
      >
        <!-- オーバーレイ -->
        <div
          class="absolute inset-0 bg-black/50 transition-opacity"
          @click="handleOverlayClick(dialog.id)"
        />

        <!-- ダイアログ本体 -->
        <div
          class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
        >
          <!-- ヘッダー -->
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ dialog.options.title }}
            </h3>
          </div>

          <!-- コンテンツ -->
          <div class="px-6 py-4">
            <p class="text-gray-700 whitespace-pre-wrap">
              {{ dialog.options.message }}
            </p>
          </div>

          <!-- フッター -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <KtButton
              v-for="button in dialog.options.buttons"
              :key="button.action"
              :variant="button.variant || 'secondary'"
              size="md"
              @click="handleAction(dialog.id, button.action)"
            >
              {{ button.label }}
            </KtButton>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-active > div:last-child,
.dialog-leave-active > div:last-child {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from > div:last-child,
.dialog-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}
</style>
