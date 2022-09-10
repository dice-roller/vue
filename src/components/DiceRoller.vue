<script setup>
import { computed, ref } from 'vue';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';

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
  <section :id="id" class="dice-roller">
    <output v-if="output" name="output" :for="inputId" class="dice-roller-output">
      {{ output }}
    </output>

    <div>
      <label :for="inputId">
        Notation
      </label>

      <input
          type="text"
          name="notation"
          :id="inputId"
          :placeholder="`e.g. ${notation || '4d6'}`"
          v-model="currentNotation"
          @change="$emit('notation:change', $event.target.value)"
          @keyup.enter="roll"
      />

      <button type="button" @click="roll">
        <slot name="button">{{ buttonLabel }}</slot>
      </button>
    </div>

    <span v-if="error">{{ error }}</span>
  </section>
</template>
