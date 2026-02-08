<script setup>
import DiceRollerRenderless from './DiceRollerRenderless.vue';
import { useIdGenerator } from '../composables/idGenerator.js';
import { ClipboardIcon } from '@heroicons/vue/24/outline';

defineEmits(['notation:change', 'roll']);

const props = defineProps({
  btnLabel: {
    type: String,
    default: 'Roll',
  },
  id: String,
  notation: String,
});

const { id: inputId } = useIdGenerator(`${props.id || 'dice-roller'}-`);
</script>

<template>
  <DiceRollerRenderless
    :notation="notation"
    v-slot="{ error, output, roll, on, bind, copy }"
    @notation:change="$emit('notation:change', $event)"
    @roll="$emit('roll', $event)"
  >
    <div
      :id="id"
      class="dice-roller p-4 rounded bg-slate-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
    >
      <output
        v-if="output"
        name="output"
        :for="inputId"
        class="flex flex-row flex-nowrap justify-between mb-8 p-4 text-2xl rounded bg-white text-black dark:bg-gray-300 dark:text-gray-800 border-l-8 border-[#d4f4c6]"
      >
        {{ output }}

        <button
          v-if="copy.isSupported"
          title="Copy to clipboard"
          class="relative group/copy"
          @click="copy.copy()"
        >
          <ClipboardIcon
            class="w-6 h-6 opacity-50 group-hover/copy:opacity-100"
          />

          <span
            v-if="copy.copied"
            class="absolute content-center top-1/2 -my-3 h-6 right-full text-sm color-gray-500"
          >
            Copied!
          </span>
          <span v-else class="sr-only"> Copy to clipboard </span>
        </button>
      </output>

      <div class="flex flex-col sm:flex-row gap-y-4">
        <label :for="inputId" class="sr-only"> Notation </label>

        <input
          type="text"
          name="notation"
          :id="inputId"
          :placeholder="`e.g. ${notation || '4d6'}`"
          class="flex-auto block w-full h-11 py-2 px-4 text-base border shadow-sm rounded placeholder-gray-500 focus:ring-[#d4f4c6] focus:border-[#d4f4c6] focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-400 invalid:text-red-600 invalid:border-red-200 invalid:bg-red-50 sm:border-r-0 sm:rounded-r-none"
          :class="
            error
              ? 'text-red-600 border-red-200 bg-red-50'
              : 'bg-white text-gray-900 border-gray-300 dark:text-gray-600 dark:bg-gray-50 dark:border-gray-700'
          "
          v-on="on"
          v-bind="bind"
        />

        <button
          type="button"
          class="block px-8 h-11 font-bold text-gray-600 bg-gradient-to-br from-[#eda18b] to-[#d4f4c6] border border-l-0 border-gray-300 rounded transition dark:border-gray-700 focus:from-[#e88c71] focus:to-[#bbf0a3] focus:text-gray-800 focus:ring-[#d4f4c6] focus:border-[#d4f4c6] focus:outline-none hover:from-[#e88c71] hover:to-[#bbf0a3] hover:text-gray-800 sm:rounded-l-none"
          :disabled="!bind.value"
          @click="roll"
        >
          <slot name="button">{{ btnLabel }}</slot>
        </button>
      </div>

      <span
        v-if="error"
        class="block mt-4 text-red-600 text-sm dark:text-red-200"
      >
        {{ error }}
      </span>
    </div>
  </DiceRollerRenderless>
</template>
