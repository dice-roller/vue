<script setup>
import { visuallyHiddenStyle } from '../accessibility.js';
import { useDiceRoller } from '../composables/useDiceRoller.js';
import { useIdGenerator } from '../composables/idGenerator.js';
import { ClipboardIcon } from '@heroicons/vue/24/outline';

defineOptions({ inheritAttrs: false });

const emit = defineEmits(['notation:change', 'update:notation', 'roll']);

const props = defineProps({
  btnLabel: {
    type: String,
    default: 'Roll',
  },
  id: String,
  notation: String,
  labels: Object,
  inputAttrs: {
    type: Object,
    default: () => ({}),
  },
});

const { id: inputId } = useIdGenerator(`${props.id || 'dice-roller'}-`);
const {
  error,
  output,
  roll,
  labels: messages,
  bind,
  on,
  copy,
} = useDiceRoller({
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
  <div
    v-bind="$attrs"
    :id="id"
    class="dice-roller p-4 rounded bg-[color:var(--dice-roller-surface,#f1f5f9)] dark:bg-[color:var(--dice-roller-surface-dark,var(--dice-roller-surface,#4b5563))] text-[color:var(--dice-roller-text,#1f2937)] dark:text-[color:var(--dice-roller-text-dark,var(--dice-roller-text,#e5e7eb))]"
  >
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
      class="flex flex-row flex-nowrap justify-between mb-4 p-4 text-2xl rounded bg-[color:var(--dice-roller-output-surface,#fff)] dark:bg-[color:var(--dice-roller-output-surface-dark,var(--dice-roller-output-surface,#1e293b))] text-[color:var(--dice-roller-output-text,#000)] dark:text-[color:var(--dice-roller-output-text-dark,var(--dice-roller-output-text,#e2e8f0))] border-l-8 border-[color:var(--dice-roller-output-accent,var(--dice-roller-primary,#d4f4c6))] dark:border-[color:var(--dice-roller-output-accent-dark,var(--dice-roller-output-accent,var(--dice-roller-primary,#6b8f63)))]"
    >
      {{ output }}

      <button
        v-if="copy.isSupported"
        type="button"
        :title="messages.copy"
        :aria-label="messages.copy"
        class="relative inline-flex shrink-0 items-center group/copy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dice-roller-focus-outline,#1f2937)] dark:focus-visible:outline-[color:var(--dice-roller-focus-outline-dark,var(--dice-roller-focus-outline,#fff))]"
        @click="copy.copy()"
      >
        <ClipboardIcon
          class="w-6 h-6 opacity-50 group-hover/copy:opacity-100"
        />

        <span
          v-if="copy.copied"
          class="pointer-events-none absolute right-full top-1/2 z-10 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-[color:var(--dice-roller-copy-surface,#111827)] px-2 py-1 text-sm font-medium text-[color:var(--dice-roller-copy-text,#fff)] shadow-md"
        >
          {{ messages.copied }}
        </span>
        <span v-else class="sr-only">{{ messages.copy }}</span>
      </button>
    </output>

    <span
      role="status"
      aria-live="polite"
      :class="
        copy.error
          ? 'block mt-2 text-[color:var(--dice-roller-error,#b91c1c)] dark:text-[color:var(--dice-roller-error-dark,var(--dice-roller-error,#fecaca))]'
          : 'sr-only'
      "
      >{{ copy.error || (copy.copied ? messages.copied : '') }}</span
    >

    <div class="flex flex-col sm:flex-row gap-y-4">
      <label :for="inputId" class="sr-only">{{ messages.notation }}</label>

      <input
        v-bind="{ ...inputAttrs, ...bind }"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="
          [inputAttrs['aria-describedby'], error ? `${inputId}-error` : null]
            .filter(Boolean)
            .join(' ') || undefined
        "
        type="text"
        name="notation"
        :id="inputId"
        :placeholder="`e.g. ${notation || '4d6'}`"
        class="min-w-0 flex-1 block w-full h-11 py-2 px-4 text-base border shadow-sm rounded placeholder-[color:var(--dice-roller-input-placeholder,#6b7280)] dark:placeholder-[color:var(--dice-roller-input-placeholder-dark,var(--dice-roller-input-placeholder,#94a3b8))] focus:ring-[color:var(--dice-roller-focus,var(--dice-roller-primary,#d4f4c6))] focus:border-[color:var(--dice-roller-focus,var(--dice-roller-primary,#d4f4c6))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dice-roller-focus-outline,#1f2937)] dark:focus-visible:outline-[color:var(--dice-roller-focus-outline-dark,var(--dice-roller-focus-outline,#fff))] focus:placeholder-[color:var(--dice-roller-input-placeholder-focus,#9ca3af)] dark:focus:placeholder-[color:var(--dice-roller-input-placeholder-focus-dark,var(--dice-roller-input-placeholder-focus,#94a3b8))] invalid:text-[color:var(--dice-roller-input-error-text,var(--dice-roller-error,#b91c1c))] invalid:border-[color:var(--dice-roller-input-error-border,#fecaca)] invalid:bg-[color:var(--dice-roller-input-error-surface,#fef2f2)] sm:border-r-0 sm:rounded-r-none"
        :class="
          error
            ? 'text-[color:var(--dice-roller-input-error-text,var(--dice-roller-error,#b91c1c))] border-[color:var(--dice-roller-input-error-border,#fecaca)] bg-[color:var(--dice-roller-input-error-surface,#fef2f2)]'
            : 'bg-[color:var(--dice-roller-input-surface,#fff)] dark:bg-[color:var(--dice-roller-input-surface-dark,var(--dice-roller-input-surface,#0f172a))] text-[color:var(--dice-roller-input-text,#111827)] dark:text-[color:var(--dice-roller-input-text-dark,var(--dice-roller-input-text,#e2e8f0))] border-[color:var(--dice-roller-border,#d1d5db)] dark:border-[color:var(--dice-roller-border-dark,var(--dice-roller-border,#374151))]'
        "
        v-on="on"
      />

      <button
        type="button"
        class="inline-flex shrink-0 items-center justify-center whitespace-nowrap px-8 h-11 font-bold text-[color:var(--dice-roller-on-primary,#111827)] bg-gradient-to-br from-[color:var(--dice-roller-button-from,var(--dice-roller-primary,#eda18b))] to-[color:var(--dice-roller-button-to,var(--dice-roller-primary,#d4f4c6))] border sm:border-l-0 border-[color:var(--dice-roller-border,#d1d5db)] rounded transition dark:border-[color:var(--dice-roller-border-dark,var(--dice-roller-border,#374151))] focus:from-[color:var(--dice-roller-button-hover-from,var(--dice-roller-primary-hover,var(--dice-roller-primary,#e88c71)))] focus:to-[color:var(--dice-roller-button-hover-to,var(--dice-roller-primary-hover,var(--dice-roller-primary,#bbf0a3)))] focus:text-[color:var(--dice-roller-on-primary,#1f2937)] focus:ring-[color:var(--dice-roller-focus,var(--dice-roller-primary,#d4f4c6))] focus:border-[color:var(--dice-roller-focus,var(--dice-roller-primary,#d4f4c6))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dice-roller-focus-outline,#1f2937)] dark:focus-visible:outline-[color:var(--dice-roller-focus-outline-dark,var(--dice-roller-focus-outline,#fff))] hover:from-[color:var(--dice-roller-button-hover-from,var(--dice-roller-primary-hover,var(--dice-roller-primary,#e88c71)))] hover:to-[color:var(--dice-roller-button-hover-to,var(--dice-roller-primary-hover,var(--dice-roller-primary,#bbf0a3)))] hover:text-[color:var(--dice-roller-on-primary,#1f2937)] sm:rounded-l-none"
        :disabled="!bind.value || inputAttrs.disabled"
        @click="roll"
      >
        <slot name="button">{{ btnLabel }}</slot>
      </button>
    </div>

    <span
      v-if="error"
      :id="`${inputId}-error`"
      role="alert"
      class="block mt-4 text-sm text-[color:var(--dice-roller-error,#b91c1c)] dark:text-[color:var(--dice-roller-error-dark,var(--dice-roller-error,#fecaca))]"
    >
      {{ error }}
    </span>
  </div>
</template>
