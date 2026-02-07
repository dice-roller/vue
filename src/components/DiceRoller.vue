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
  className: {
    type: String,
    default: 'dice-roller',
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
    <section :id="id" :class="className">
      <output
        v-if="output"
        name="output"
        :for="inputId"
        :class="`${className}-output`"
      >
        {{ output }}

        <button
          v-if="copy.isSupported"
          title="Copy to clipboard"
          :class="`${className}-copy-button`"
          @click="copy.copy()"
        >
          <ClipboardIcon :class="`${className}-copy-icon`" />

          <span
            v-if="copy.copied"
            :class="`${className}-copy-label-success`"
          >
            Copied!
          </span>
          <span
            v-else
            :class="`${className}-copy-label`"
          >
            Copy
          </span>
        </button>
      </output>

      <div :class="`${className}-input-group`">
        <label
          :for="inputId"
          :class="`${className}-label`"
        >
          Notation
        </label>

        <input
          type="text"
          name="notation"
          :id="inputId"
          :placeholder="`e.g. ${notation || '4d6'}`"
          :class="[
            `${className}-input`,
            error ? `${className}-input-invalid` : null,
          ]"
          v-on="on"
          v-bind="bind"
        />

        <button type="button" :class="`${className}-button`" @click="roll">
          <slot name="button">{{ btnLabel }}</slot>
        </button>
      </div>

      <span v-if="error" :class="`${className}-error`">{{ error }}</span>
    </section>
  </DiceRollerRenderless>
</template>
