<script setup>
import { ref, unref } from 'vue';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { useClipboard } from '@vueuse/core';

const emit = defineEmits(['notation:change', 'roll']);

const props = defineProps({
  notation: String,
});

const currentNotation = ref(`${props.notation || ''}`);
const error = ref(null);
const output = ref(null);

const roll = async () => {
  error.value = null;

  try {
    output.value = currentNotation.value
      ? new DiceRoll(unref(currentNotation))
      : null;
  } catch (e) {
    output.value = null;

    if (e.name === 'SyntaxError') {
      error.value = `Invalid notation; ${e.message}`;
    } else {
      error.value = `An error has occurred: ${e.message}`;
    }
  } finally {
    emit('roll', unref(currentNotation), unref(output));
  }
};

const setNotation = (notation) => {
  currentNotation.value = notation;

  emit('notation:change', notation);
};

const { text, copy, copied, isSupported } = useClipboard({ output });
const copyOutput = () => copy(`${unref(output)}`);
</script>

<template>
  <slot
    :current-notation="currentNotation"
    :error="error"
    :output="output"
    :roll="roll"
    :bind="{ value: currentNotation }"
    :on="{
      input: (event) => setNotation(event.target.value),
      change: (event) => setNotation(event.target.value),
      keyup: (event) => (event.keyCode === 13 ? roll() : undefined),
    }"
    :copy="{
      copy: copyOutput,
      copied,
      text,
      isSupported,
    }"
  />
</template>
