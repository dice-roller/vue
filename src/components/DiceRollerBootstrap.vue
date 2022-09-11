<script>
const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
const bgVariants = [...variants, ...['body', 'white', 'transparent']];
const textVariants = [...variants, ...['body', 'muted', 'white', 'black-50', 'white-50']];
const btnVariants = [...variants, ...[
  'link',
  'outline-primary',
  'outline-secondary',
  'outline-success',
  'outline-danger',
  'outline-warning',
  'outline-info',
  'outline-light',
  'outline-dark',
]];
const borderVariants = [...variants, ...['white']];
</script>

<script setup>
import { computed } from 'vue';
import DiceRollerRenderless from './DiceRollerRenderless.vue';
import { useIdGenerator } from '../composables/idGenerator.js';

defineEmits(['notation:change', 'roll']);

const props = defineProps({
  bgVariant: {
    type: String,
    validator(value) {
      return bgVariants.includes(value);
    },
  },
  borderVariant: {
    type: String,
    validator(value) {
      return borderVariants.includes(value);
    },
  },
  btnLabel: {
    type: String,
    default: 'Roll',
  },
  btnVariant: {
    type: String,
    default: 'primary',
    validator(value) {
      return btnVariants.includes(value);
    },
  },
  id: String,
  notation: String,
  outputBgVariant: {
    type: String,
    validator(value) {
      return bgVariants.includes(value);
    },
  },
  outputBorderVariant: {
    type: String,
    validator(value) {
      return borderVariants.includes(value);
    },
  },
  outputTextVariant: {
    type: String,
    validator(value) {
      return textVariants.includes(value);
    },
  },
  outputVariant: {
    type: String,
    validator(value) {
      return variants.includes(value);
    },
  },
  textVariant: {
    type: String,
    validator(value) {
      return textVariants.includes(value);
    },
  },
  variant: {
    type: String,
    validator(value) {
      return variants.includes(value);
    },
  },
});

const cardClass = computed(() => {
    return {
      [`text-bg-${props.variant}`]: props.variant,
      [`bg-${props.bgVariant}`]: props.bgVariant,
      [`text-${props.textVariant}`]: props.textVariant,
      [`border-${props.borderVariant}`]: props.borderVariant,
    };
});

const outputClass = computed(() => {
  return {
    [`text-bg-${props.outputVariant}`]: props.outputVariant,
    [`bg-${props.outputBgVariant}`]: props.outputBgVariant,
    [`text-${props.outputTextVariant}`]: props.outputTextVariant,
    [`border-${props.outputBorderVariant}`]: props.outputBorderVariant,
  }
});

const buttonClass = computed(() => {
  return `btn-${props.btnVariant || 'primary'}`;
});

const { id: inputId } = useIdGenerator(`${props.id || 'dice-roller'}-`);
</script>

<template>
  <DiceRollerRenderless
      :notation="notation"
      v-slot="{ error, output, roll, on, bind }"
      @notation:change="$emit('notation:change', $event)"
      @roll="$emit('roll', $event)"
  >
    <div :id="id" class="dice-roller card" :class="cardClass">
      <div class="card-body">
        <output
            v-if="output"
            name="output"
            :for="inputId"
            class="d-block mb-4 p-3 fs-4 rounded border"
            :class="outputClass"
        >
          {{ output }}
        </output>

        <label :for="inputId" class="form-label visually-hidden">
          Notation
        </label>

        <div class="input-group">
          <input
              type="text"
              name="notation"
              :id="inputId"
              :placeholder="`e.g. ${notation || '4d6'}`"
              class="form-control"
              :class="error ? 'is-invalid' : ''"
              v-on="on"
              v-bind="bind"
          />

          <button
              type="button"
              class="btn"
              :class="buttonClass"
              @click="roll"
          >
            <slot name="button">{{ btnLabel }}</slot>
          </button>
        </div>

        <span v-if="error" class="d-block mt-3 invalid-feedback">
          {{ error }}
        </span>
      </div>
    </div>
  </DiceRollerRenderless>
</template>
