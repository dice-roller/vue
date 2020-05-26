<template>
  <section class="dice-roller">
    <transition name="fade">
      <output name="output" :for="`notation-${this.uuid}`" class="output" v-if="output">
        {{ output }}
      </output>
    </transition>

    <input
      type="text"
      name="notation"
      :id="`notation-${this.uuid}`"
      :placeholder="`e.g. ${this.notation || '4d6'}`"
      v-model="notationString"
      :class="error ? 'is-invalid' : ''"
      @change="$emit('notation:change', $event.target.value)"
      @keyup.enter="roll"
    />

    <transition name="fade">
      <span class="invalid-feedback" v-if="error">{{ error }}</span>
    </transition>

    <footer>
      <label :for="`notation-${this.uuid}`">
        Enter the notation and press "enter" to roll the dice!
      </label>
    </footer>
  </section>
</template>

<script>
const { DiceRoll } = require('rpg-dice-roller/lib/umd/bundle.js');

let uuid = 0;

module.exports = {
  beforeCreate() {
    this.uuid = uuid.toString();
    uuid += 1;
  },
  data() {
    return {
      error: null,
      notationString: this.notation,
      output: null,
    };
  },
  props: {
    notation: {
      type: String,
      required: false,
    },
  },
  methods: {
    roll() {
      this.error = null;

      try {
        this.output = this.notationString ? new DiceRoll(this.notationString) : null;
      } catch (error) {
        this.output = null;

        if (error.name === 'SyntaxError') {
          this.error = `Invalid notation; ${error.message}`;
        } else {
          this.error = `An error has occurred: ${error.message}`;
        }
      } finally {
        this.$emit('roll', this.notationString);
      }
    },
  },
};
</script>

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
