<script setup lang="ts">
import DiceRollerRenderless from '../src/components/DiceRollerRenderless.vue';
</script>

<template>
  <DiceRollerRenderless
    notation="4d6"
    v-slot="{ error, output, roll, on, bind, copy }"
  >
    <div
      class="p-4 rounded bg-slate-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
    >
      <label for="renderless-notation" class="block mb-2 font-bold"
        >Notation</label
      >
      <input
        id="renderless-notation"
        class="block w-full h-11 px-4 text-black rounded"
        type="text"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? 'renderless-error' : undefined"
        v-on="on"
        v-bind="bind"
      />
      <button
        type="button"
        class="block w-full rounded bg-red-300 text-gray-900 px-4 py-2 my-4"
        :disabled="!bind.value"
        @click="roll"
      >
        Roll
      </button>
      <p
        id="renderless-error"
        v-if="error"
        role="alert"
        class="mb-4 text-red-700 dark:text-red-200"
      >
        {{ error }}
      </p>
      <output class="block font-mono" aria-live="polite">{{
        output ? String(output) : ''
      }}</output>
      <button
        v-if="output && copy.isSupported"
        type="button"
        class="mt-4 px-4 py-2 rounded bg-white text-gray-900"
        @click="copy.copy()"
      >
        Copy to clipboard
      </button>
      <p role="status" aria-live="polite">
        {{ copy.error || (copy.copied ? 'Copied!' : '') }}
      </p>
    </div>
  </DiceRollerRenderless>
</template>
