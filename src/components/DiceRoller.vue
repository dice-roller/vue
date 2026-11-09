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
  className: {
    type: String,
    default: 'dice-roller',
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
    <section v-bind="$attrs" :id="id" :class="className">
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
        :class="`${className}-output`"
      >
        {{ output }}

        <button
          v-if="copy.isSupported"
          type="button"
          :title="messages.copy"
          :aria-label="messages.copy"
          :class="`${className}-copy-button`"
          @click="copy.copy()"
        >
          <ClipboardIcon :class="`${className}-copy-icon`" />

          <span v-if="copy.copied" :class="`${className}-copy-label-success`">
            {{ messages.copied }}
          </span>
          <span v-else :class="`${className}-copy-label`">
            {{ messages.copy }}
          </span>
        </button>
      </output>

      <span
        role="status"
        aria-live="polite"
        :style="copy.error ? undefined : visuallyHiddenStyle"
        :class="`${className}-copy-status`"
        >{{ copy.error || (copy.copied ? messages.copied : '') }}</span
      >

      <div :class="`${className}-input-group`">
        <label :for="inputId" :class="`${className}-label`">
          {{ messages.notation }}
        </label>

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
          :class="[
            `${className}-input`,
            error ? `${className}-input-invalid` : null,
          ]"
          v-on="on"
        />

        <button
          type="button"
          :class="`${className}-button`"
          :disabled="!bind.value || inputAttrs.disabled"
          @click="roll"
        >
          <slot name="button">{{ btnLabel }}</slot>
        </button>
      </div>

      <span
        :id="`${inputId}-error`"
        role="alert"
        v-if="error"
        :class="`${className}-error`"
        >{{ error }}</span
      >
    </section>
  </DiceRollerRenderless>
</template>
