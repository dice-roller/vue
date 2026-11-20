<script setup lang="ts">
import type { PropType } from 'vue';
import type {
  DiceRollerEmits,
  DiceRollerLabels,
  DiceRollerSlotProps,
} from '../types.js';
import { useDiceRoller } from '../composables/useDiceRoller.js';
import type { RollInputData } from '@dice-roller/rpg-dice-roller';

defineSlots<{
  default?: (props: DiceRollerSlotProps) => import('vue').VNodeChild;
}>();

const emit = defineEmits<DiceRollerEmits>();
const props = defineProps({
  notation: String,
  labels: {
    type: Object as PropType<Partial<DiceRollerLabels>>,
    default: () => ({}),
  },
  data: {
    type: Object as PropType<RollInputData>,
    required: false,
    default: () => ({}),
  },
});

const { currentNotation, data, error, output, roll, labels, bind, on, copy } =
  useDiceRoller({
    notation: () => props.notation,
    labels: () => props.labels,
    data: () => props.data,
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
    :data="data"
  />
</template>
