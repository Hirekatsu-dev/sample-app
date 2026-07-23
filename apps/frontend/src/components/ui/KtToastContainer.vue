<script setup lang="ts">
import { useToastMessages } from '@/composables/use_toast_messages';
import KtToast from './KtToast.vue';

const { messages, removeToast } = useToastMessages();
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[1100] flex flex-col gap-2 w-96">
      <TransitionGroup name="toast">
        <KtToast
          v-for="toast in messages"
          :key="toast.id"
          :message="toast.message"
          :type="toast.type"
          :timeout="toast.timeout ?? 5000"
          @close="removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
