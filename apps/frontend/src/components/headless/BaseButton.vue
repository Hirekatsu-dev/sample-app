<script lang="ts" setup>
import { computed, ref, useAttrs } from 'vue';

interface BaseButtonProps {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  ariaDescription?: string;
  autofocus?: boolean;
  tabindex?: number;
}

interface BaseButtonEmits {
  click: [event: MouseEvent];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
  keyup: [event: KeyboardEvent];
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  type: 'button',
  disabled: false,
  loading: false,
  tabindex: 0,
});

const emit = defineEmits<BaseButtonEmits>();

const attrs = useAttrs();
const buttonRef = ref<HTMLButtonElement>();

const isDisabled = computed(() => props.disabled || props.loading);

const ariaAttributes = computed(() => ({
  'aria-disabled': isDisabled.value || undefined,
  'aria-busy': props.loading || undefined,
  'aria-label': props.ariaLabel || undefined,
  'aria-describedby': props.ariaDescription
    ? `${attrs.id || 'button'}-description`
    : undefined,
}));

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit('click', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.key === 'Enter' || event.key === ' ') && !isDisabled.value) {
    event.preventDefault();
    const syntheticEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    handleClick(syntheticEvent);
  }
  emit('keydown', event);
};

const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event);
};

const focus = () => {
  buttonRef.value?.focus();
};

const blur = () => {
  buttonRef.value?.blur();
};

defineExpose({
  focus,
  blur,
  element: buttonRef,
});
</script>

<template>
  <button
    ref="buttonRef"
    :type="type"
    :disabled="isDisabled"
    :autofocus="autofocus"
    :tabindex="tabindex"
    v-bind="ariaAttributes"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
    @keyup="handleKeyup"
  >
    <slot
      :disabled="isDisabled"
      :loading="loading"
      :focus="focus"
      :blur="blur"
    />
  </button>

  <span
    v-if="ariaDescription"
    :id="`${$attrs.id || 'button'}-description`"
    class="sr-only"
  >
    {{ ariaDescription }}
  </span>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
