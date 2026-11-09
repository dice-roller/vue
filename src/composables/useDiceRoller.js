import { computed, reactive, ref, toValue, watch } from 'vue';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { useSupported, useTimeoutFn } from '@vueuse/core';

/**
 * Create an independent dice roller inside setup() or <script setup>.
 * notation and labels accept plain values, refs or getters.
 * Source updates are silent; local edits call onNotationChange once.
 * onRoll receives (notation, result), including null for empty/failed rolls.
 */
export function useDiceRoller(options = {}) {
  const labels = computed(() => ({
    notation: 'Notation',
    copy: 'Copy to clipboard',
    copied: 'Copied!',
    copyError: 'Unable to copy to clipboard. Please try again.',
    invalidNotation: 'Invalid notation',
    error: 'An error has occurred',
    ...toValue(options.labels),
  }));
  const notationValue = ref(toValue(options.notation) ?? '');
  const error = ref(null);
  const output = ref(null);
  const clipboardError = ref(null);

  watch(
    () => toValue(options.notation),
    (notation) => {
      notationValue.value = notation ?? '';
    },
  );

  const roll = () => {
    error.value = null;
    clipboardError.value = null;
    try {
      output.value = notationValue.value
        ? new DiceRoll(notationValue.value)
        : null;
    } catch (e) {
      output.value = null;
      error.value = `${
        e.name === 'SyntaxError'
          ? labels.value.invalidNotation
          : labels.value.error
      }: ${e.message}`;
    } finally {
      options.onRoll?.(notationValue.value, output.value);
    }
  };

  const setNotation = (notation) => {
    if (notationValue.value === notation) return;
    notationValue.value = notation;
    options.onNotationChange?.(notation);
  };

  const currentNotation = computed({
    get: () => notationValue.value,
    set: setNotation,
  });

  const onKeydown = (event) => {
    if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229)
      return;
    event.preventDefault();
    if (!event.repeat && !event.target?.disabled && notationValue.value) roll();
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

  const bind = computed(() => ({ value: currentNotation.value }));
  const on = {
    input: (event) => setNotation(event.target.value),
    change: (event) => setNotation(event.target.value),
    keydown: onKeydown,
  };
  const copy = reactive({
    copy: copyOutput,
    copied,
    text,
    isSupported,
    error: clipboardError,
  });

  return {
    currentNotation,
    error,
    output,
    roll,
    labels,
    setNotation,
    bind,
    on,
    copy,
  };
}
