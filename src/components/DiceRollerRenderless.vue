<script setup>
import { computed, ref, unref, watch } from 'vue';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { useSupported, useTimeoutFn } from '@vueuse/core';

const emit = defineEmits(['notation:change', 'update:notation', 'roll']);
const props = defineProps({
  notation: String,
  labels: {
    type: Object,
    default: () => ({}),
  },
});

const labels = computed(() => ({
  notation: 'Notation',
  copy: 'Copy to clipboard',
  copied: 'Copied!',
  copyError: 'Unable to copy to clipboard. Please try again.',
  invalidNotation: 'Invalid notation',
  error: 'An error has occurred',
  ...props.labels,
}));
const currentNotation = ref(props.notation ?? '');
const error = ref(null);
const output = ref(null);
const clipboardError = ref(null);

watch(
  () => props.notation,
  (notation) => {
    currentNotation.value = notation ?? '';
  },
);

const roll = () => {
  error.value = null;
  clipboardError.value = null;
  try {
    output.value = currentNotation.value
      ? new DiceRoll(currentNotation.value)
      : null;
  } catch (e) {
    output.value = null;
    error.value = `${
      e.name === 'SyntaxError'
        ? labels.value.invalidNotation
        : labels.value.error
    }: ${e.message}`;
  } finally {
    emit('roll', unref(currentNotation), unref(output));
  }
};

const setNotation = (notation) => {
  if (currentNotation.value === notation) return;
  currentNotation.value = notation;
  emit('update:notation', notation);
  emit('notation:change', notation);
};

const onKeydown = (event) => {
  if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229)
    return;
  event.preventDefault();
  if (!event.repeat && !event.target?.disabled && currentNotation.value) roll();
};

const source = computed(() => (output.value ? String(output.value) : ''));
const text = ref('');
const copied = ref(false);
const isSupported = useSupported(
  () =>
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.writeText === 'function',
);
const { start: resetCopied, stop: stopResetCopied } = useTimeoutFn(
  () => {
    copied.value = false;
  },
  1500,
  { immediate: false },
);
const copyOutput = async () => {
  clipboardError.value = null;
  copied.value = false;
  stopResetCopied();
  if (!output.value) return;
  const value = source.value;
  try {
    await navigator.clipboard.writeText(value);
    text.value = value;
    copied.value = true;
    resetCopied();
  } catch {
    clipboardError.value = labels.value.copyError;
  }
};
</script>

<template>
  <slot
    :current-notation="currentNotation"
    :error="error"
    :output="output"
    :roll="roll"
    :labels="labels"
    :bind="{ value: currentNotation }"
    :on="{
      input: (event) => setNotation(event.target.value),
      change: (event) => setNotation(event.target.value),
      keydown: onKeydown,
    }"
    :copy="{
      copy: copyOutput,
      copied,
      text,
      isSupported,
      error: clipboardError,
    }"
  />
</template>
