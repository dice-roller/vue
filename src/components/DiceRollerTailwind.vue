<script setup>
import { visuallyHiddenStyle } from '../accessibility.js';
import DiceRollerRenderless from './DiceRollerRenderless.vue';
import { useIdGenerator } from '../composables/idGenerator.js';
import { ClipboardIcon } from '@heroicons/vue/24/outline';

defineOptions({ inheritAttrs: false });

defineEmits(['notation:change', 'update:notation', 'roll']);

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
    <div
      v-bind="$attrs"
      :id="id"
      class="dice-roller p-4 rounded bg-slate-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
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
        class="flex flex-row flex-nowrap justify-between mb-8 p-4 text-2xl rounded bg-white text-black dark:bg-gray-300 dark:text-gray-800 border-l-8 border-[#d4f4c6]"
      >
        {{ output }}

        <button
          v-if="copy.isSupported"
          type="button"
          :title="messages.copy"
          :aria-label="messages.copy"
          class="relative group/copy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
          @click="copy.copy()"
        >
          <ClipboardIcon
            class="w-6 h-6 opacity-50 group-hover/copy:opacity-100"
          />

          <span
            v-if="copy.copied"
            class="absolute content-center top-1/2 -my-3 h-6 right-full text-sm text-gray-500"
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
          copy.error ? 'block mt-2 text-red-700 dark:text-red-200' : 'sr-only'
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
          class="flex-auto block w-full h-11 py-2 px-4 text-base border shadow-sm rounded placeholder-gray-500 focus:ring-[#d4f4c6] focus:border-[#d4f4c6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 dark:focus-visible:outline-white focus:placeholder-gray-400 dark:focus:placeholder-gray-400 invalid:text-red-700 invalid:border-red-200 invalid:bg-red-50 sm:border-r-0 sm:rounded-r-none"
          :class="
            error
              ? 'text-red-700 border-red-200 bg-red-50'
              : 'bg-white text-gray-900 border-gray-300 dark:text-gray-600 dark:bg-gray-50 dark:border-gray-700'
          "
          v-on="on"
        />

        <button
          type="button"
          class="block px-8 h-11 font-bold text-gray-900 bg-gradient-to-br from-[#eda18b] to-[#d4f4c6] border border-l-0 border-gray-300 rounded transition dark:border-gray-700 focus:from-[#e88c71] focus:to-[#bbf0a3] focus:text-gray-800 focus:ring-[#d4f4c6] focus:border-[#d4f4c6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 dark:focus-visible:outline-white hover:from-[#e88c71] hover:to-[#bbf0a3] hover:text-gray-800 sm:rounded-l-none"
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
        class="block mt-4 text-red-700 text-sm dark:text-red-200"
      >
        {{ error }}
      </span>
    </div>
  </DiceRollerRenderless>
</template>
