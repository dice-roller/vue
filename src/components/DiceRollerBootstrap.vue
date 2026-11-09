<script>
const variants = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'light',
  'dark',
];
const bgVariants = [...variants, ...['body', 'white', 'transparent']];
const textVariants = [
  ...variants,
  ...['body', 'muted', 'white', 'black-50', 'white-50'],
];
const btnVariants = [
  ...variants,
  ...[
    'link',
    'outline-primary',
    'outline-secondary',
    'outline-success',
    'outline-danger',
    'outline-warning',
    'outline-info',
    'outline-light',
    'outline-dark',
  ],
];
const borderVariants = [...variants, ...['white']];
</script>

<script setup>
import { computed } from 'vue';
import { ClipboardIcon } from '@heroicons/vue/24/outline';
import { visuallyHiddenStyle } from '../accessibility.js';
import DiceRollerRenderless from './DiceRollerRenderless.vue';
import { useIdGenerator } from '../composables/idGenerator.js';

defineOptions({ inheritAttrs: false });

defineEmits(['notation:change', 'update:notation', 'roll']);

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
  labels: Object,
  inputAttrs: {
    type: Object,
    default: () => ({}),
  },
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
  };
});

const buttonClass = computed(() => {
  return `btn-${props.btnVariant || 'primary'}`;
});

const { id: inputId } = useIdGenerator(`${props.id || 'dice-roller'}-`);
</script>

<template>
  <DiceRollerRenderless
    :notation="notation"
    :labels="labels"
    v-slot="{ error, output, roll, on, bind, copy, labels: messages }"
    @notation:change="$emit('notation:change', $event)"
    @roll="(...args) => $emit('roll', ...args)"
    @update:notation="$emit('update:notation', $event)"
  >
    <div v-bind="$attrs" :id="id" class="dice-roller card" :class="cardClass">
      <div class="card-body">
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          :style="visuallyHiddenStyle"
          >{{ output ? String(output) : '' }}</span
        >
        <output
          v-if="output"
          name="output"
          aria-live="off"
          :for="inputId"
          class="d-flex align-items-center justify-content-between gap-3 mb-4 p-3 fs-4 rounded border"
          :class="outputClass"
        >
          <span class="flex-grow-1 text-break">{{ output }}</span>
          <button
            v-if="copy.isSupported"
            type="button"
            :title="messages.copy"
            :aria-label="messages.copy"
            class="btn btn-link link-body-emphasis text-decoration-none p-2 d-inline-flex align-items-center flex-shrink-0 position-relative"
            @click="copy.copy()"
          >
            <!-- Functional icons forward CSS sizing, not width/height attributes. -->
            <ClipboardIcon
              class="flex-shrink-0"
              style="width: 1.5rem; height: 1.5rem"
              aria-hidden="true"
            />
            <span
              v-if="copy.copied"
              aria-hidden="true"
              class="position-absolute top-50 end-100 translate-middle-y me-2 badge text-bg-dark fs-6 fw-normal text-nowrap shadow pe-none"
              >{{ messages.copied }}</span
            >
          </button>
        </output>
        <span
          role="status"
          aria-live="polite"
          :class="
            copy.error ? 'd-block mt-2 invalid-feedback' : 'visually-hidden'
          "
          >{{ copy.error || (copy.copied ? messages.copied : '') }}</span
        >

        <label :for="inputId" class="form-label visually-hidden">
          {{ messages.notation }}
        </label>

        <div class="input-group">
          <input
            v-bind="{ ...inputAttrs, ...bind }"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="
              [
                inputAttrs['aria-describedby'],
                error ? `${inputId}-error` : null,
              ]
                .filter(Boolean)
                .join(' ') || undefined
            "
            type="text"
            name="notation"
            :id="inputId"
            :placeholder="`e.g. ${notation || '4d6'}`"
            class="form-control"
            :class="error ? 'is-invalid' : ''"
            v-on="on"
          />

          <button
            type="button"
            class="btn"
            :class="buttonClass"
            :disabled="!bind.value || inputAttrs.disabled"
            @click="roll"
          >
            <slot name="button">{{ btnLabel }}</slot>
          </button>
        </div>

        <span
          :id="`${inputId}-error`"
          role="alert"
          v-if="error"
          class="d-block mt-3 invalid-feedback"
        >
          {{ error }}
        </span>
      </div>
    </div>
  </DiceRollerRenderless>
</template>
