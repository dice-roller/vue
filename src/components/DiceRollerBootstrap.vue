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
  console.log('roll');
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
  <div :id="id" class="dice-roller card text-bg-light">
    <div class="card-body">
      <output
          v-if="output"
          name="output"
          :for="inputId"
          class="d-block mb-4 p-3 fs-4 rounded border text-dark bg-white border-[#d4f4c6]"
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
            v-model="currentNotation"
            class="form-control"
            :class="error ? 'is-invalid' : ''"
            @change="$emit('notation:change', $event.target.value)"
            @keyup.enter="roll"
        />

        <button
            type="button"
            class="btn btn-primary"
            @click="roll"
        >
          <slot name="button">{{ buttonLabel }}</slot>
        </button>
      </div>

      <span v-if="error" class="d-block mt-3 invalid-feedback">
        {{ error }}
      </span>
    </div>
  </div>
</template>
