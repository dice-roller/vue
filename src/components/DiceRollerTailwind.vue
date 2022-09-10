<script setup>
import {computed, ref} from 'vue';
import {DiceRoll} from '@dice-roller/rpg-dice-roller';

const emit = defineEmits(['roll']);

const props = defineProps({
  buttonLabel: {
    type: String,
    default: 'Roll',
  },
  id: String,
  notation: String,
});

const currentNotation = ref(`${props.notation || ''}`);
const error = ref(null);
const output = ref(null);

const inputId = computed(() => {
  const prefix = `${props.id || 'dice-roller'}-`;
  const id = `${Date.now().toString(32)}-${Math.random().toString(36).substring(2)}`;

  return `${prefix}${id}`;
});

const roll = () => {
  error.value = null;

  try {
    output.value = currentNotation.value ? new DiceRoll(currentNotation.value) : null;
  } catch (e) {
    output.value = null;

    if (e.name === 'SyntaxError') {
      error.value = `Invalid notation; ${e.message}`;
    } else {
      error.value = `An error has occurred: ${e.message}`;
    }
  } finally {
    emit('roll', currentNotation);
  }
};
</script>

<template>
  <section :id="id" class="dice-roller p-4 rounded bg-slate-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
    <output
        v-if="output"
        name="output"
        :for="inputId"
        class="block mb-8 p-4 text-2xl rounded bg-white text-black dark:bg-gray-300 dark:text-gray-800 border-l-8 border-[#d4f4c6]"
    >
      {{ output }}
    </output>

    <div class="flex flex-col sm:flex-row gap-y-4">
      <label :for="inputId" class="sr-only">
        Notation
      </label>

      <input
          type="text"
          name="notation"
          :id="inputId"
          :placeholder="`e.g. ${notation || '4d6'}`"
          v-model="currentNotation"
          class="flex-auto block w-full h-11 py-2 px-4 text-base border shadow-sm rounded placeholder-gray-500 focus:ring-[#d4f4c6] focus:border-[#d4f4c6] focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-400 invalid:text-red-600 invalid:border-red-200 invalid:bg-red-50 sm:border-r-0 sm:rounded-r-none"
          :class="error ? 'text-red-600 border-red-200 bg-red-50' : 'bg-white text-gray-900 border-gray-300 dark:text-gray-600 dark:bg-gray-50 dark:border-gray-700'"
          @change="$emit('notation:change', $event.target.value)"
          @keyup.enter="roll"
      />

      <button
          type="button"
          class="block px-8 h-11 font-bold text-gray-600 bg-gradient-to-br from-[#eda18b] to-[#d4f4c6] border border-l-0 border-gray-300 rounded transition dark:border-gray-700 focus:from-[#e88c71] focus:to-[#bbf0a3] focus:text-gray-800 focus:ring-[#d4f4c6] focus:border-[#d4f4c6] focus:outline-none hover:from-[#e88c71] hover:to-[#bbf0a3] hover:text-gray-800 sm:rounded-l-none"
          @click="roll"
      >
        <slot name="button">{{ buttonLabel }}</slot>
      </button>
    </div>

    <span class="block mt-4 text-red-600 text-sm dark:text-red-200" v-if="error">{{ error }}</span>
  </section>
</template>
