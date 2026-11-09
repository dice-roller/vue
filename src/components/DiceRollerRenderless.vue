<script setup>
import { useDiceRoller } from '../composables/useDiceRoller.js';

const emit = defineEmits(['notation:change', 'update:notation', 'roll']);
const props = defineProps({
  notation: String,
  labels: {
    type: Object,
    default: () => ({}),
  },
});

const { currentNotation, error, output, roll, labels, bind, on, copy } =
  useDiceRoller({
    notation: () => props.notation,
    labels: () => props.labels,
    onNotationChange: (notation) => {
      emit('update:notation', notation);
      emit('notation:change', notation);
    },
    onRoll: (notation, result) => emit('roll', notation, result),
  });
</script>

<template>
  <slot
    :current-notation="currentNotation"
    :error="error"
    :output="output"
    :roll="roll"
    :labels="labels"
    :bind="bind"
    :on="on"
    :copy="copy"
  />
</template>
