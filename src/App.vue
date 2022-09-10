<script setup>
import DiceRoller from './components/DiceRoller.vue'
import DiceRollerTailwind from './components/DiceRollerTailwind.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="https://dice-roller.github.io/documentation/dice-roller-logo.png" width="125" height="125" />

    <div class="wrapper">
      <h1>RPG Dice Roller</h1>
      <h3>Easy advanced dice rolling</h3>
    </div>
  </header>

  <main>
    <div class="rollers">
      <section>
        <h2>Basic</h2>
        <DiceRoller />
      </section>

      <section>
        <h2>Tailwind</h2>
        <DiceRollerTailwind />
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
