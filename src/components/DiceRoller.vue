<script setup>
import DiceRollerRenderless from './DiceRollerRenderless.vue';
import { useIdGenerator } from '../composables/idGenerator.js';

defineEmits(['notation:change', 'roll']);

const props = defineProps({
  buttonLabel: {
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
      v-slot="{ error, output, roll, on, bind }"
      @notation:change="$emit('notation:change', $event)"
      @roll="$emit('roll', $event)"
  >
    <section :id="id" class="dice-roller">
      <output v-if="output" name="output" :for="inputId" class="dice-roller-output">
        {{ output }}
      </output>

      <div class="dice-roller-input-group">
        <label :for="inputId" class="dice-roller-label">
          Notation
        </label>

        <input
            type="text"
            name="notation"
            :id="inputId"
            :placeholder="`e.g. ${notation || '4d6'}`"
            class="dice-roller-input"
            :class="error ? 'dice-roller-input-invalid' : ''"
            v-on="on"
            v-bind="bind"
        />

        <button type="button" class="dice-roller-button" @click="roll">
          <slot name="button">{{ buttonLabel }}</slot>
        </button>
      </div>

      <span v-if="error" class="dice-roller-error">{{ error }}</span>
    </section>
  </DiceRollerRenderless>
</template>
