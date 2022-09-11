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
              class="form-control"
              :class="error ? 'is-invalid' : ''"
              v-on="on"
              v-bind="bind"
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
  </DiceRollerRenderless>
</template>
