<script setup>
import { computed, ref } from 'vue';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';

const emit = defineEmits(['roll'])

const props = defineProps({
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
    <transition name="fade">
      <output v-if="output" name="output" :for="inputId" class="output">
        {{ output }}
      </output>
    </transition>

    <input
      type="text"
      name="notation"
      :id="inputId"
      :placeholder="`e.g. ${notation || '4d6'}`"
      v-model="currentNotation"
      :class="error ? 'is-invalid' : ''"
      @change="$emit('notation:change', $event.target.value)"
      @keyup.enter="roll"
    />

    <transition name="fade">
      <span class="invalid-feedback" v-if="error">{{ error }}</span>
    </transition>

    <footer>
      <label :for="inputId">
        Enter the notation and press "enter" to roll the dice!
      </label>
    </footer>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

input:invalid,
input.is-invalid {
  color: #ff0000;
}

.invalid-feedback {
  display: block;
  margin: .5rem 0 0;
  color: #ff0000;
  font-size: .8rem;
}

.dice-roller {
  margin: 1rem 0;
  padding: 1rem 1.5rem;
  border-radius: .4rem;
  background-color: #f0f4f8;
}

.output {
  display: block;
  margin: 0 0 1rem;
  padding: .5rem 1.9rem;
  font-size: 1.5rem;
  border-radius: .4rem;
  background: #fff;
}

footer {
  font-size: .8rem;
}
</style>
