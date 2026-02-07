<script setup>
import DiceRoller from './components/DiceRoller.vue';
import DiceRollerTailwind from './components/DiceRollerTailwind.vue';
import DiceRollerBootstrap from './components/DiceRollerBootstrap.vue';
import DiceRollerRenderless from './components/DiceRollerRenderless.vue';
</script>

<template>
  <header>
    <img
      alt="Dice Roller logo"
      class="logo"
      src="https://dice-roller.github.io/documentation/dice-roller-logo.png"
      width="125"
      height="125"
    />

    <div class="wrapper">
      <h1>RPG Dice Roller</h1>
      <h3>Easy advanced dice rolling</h3>
    </div>
  </header>

  <main>
    <div class="rollers">
      <section>
        <h2>Renderless</h2>

        <DiceRollerRenderless
          notation="10d2"
          v-slot="{ currentNotation, error, output, roll, on, bind, copy }"
        >
          <div
            class="p-4 rounded bg-slate-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
          >
            <div v-if="error">{{ error }}</div>

            <input
              class="block w-full text-base h-11 px-4 text-black"
              type="text"
              v-on="on"
              v-bind="bind"
            />

            <button
              type="button"
              class="block w-full bg-red-300 dark:bg-gray-800 px-4 py-2 my-4"
              @click="roll"
            >
              Roll
            </button>

            <div class="block mb-8">
              <strong>Notation:</strong> <em>{{ currentNotation }}</em>
            </div>

            <output
              v-if="output"
              class="block p-4 bg-teal-100 dark:bg-yellow-100 text-gray-600 font-bold font-mono"
            >
              {{ output }}
            </output>

            <button
              v-if="output && copy.isSupported"
              title="Copy to clipboard"
              class="mt-1 px-4 py-2 dark:bg-slate-800"
              @click="copy.copy()"
            >
              <template v-if="copy.copied">Copied!</template>
              <template v-else>Copy to clipboard</template>
            </button>
          </div>
        </DiceRollerRenderless>
      </section>

      <section>
        <h2>Un-styled</h2>

        <DiceRoller />
      </section>

      <section>
        <h2>Tailwind</h2>

        <DiceRollerTailwind />
      </section>

      <section>
        <h2>Bootstrap</h2>

        <DiceRollerBootstrap />
      </section>
    </div>
  </main>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h2 {
  color: #6a8bad;
  font-size: 2rem;
}

h3 {
  color: #6a8bad;
  font-size: 1.6rem;
}

header {
  line-height: 1.5;
}

header .wrapper {
  text-align: center;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.rollers {
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
    text-align: left;
  }
}
</style>
