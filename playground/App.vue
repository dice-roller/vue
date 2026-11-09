<script setup lang="ts">
import BootstrapPreview from './BootstrapPreview.vue';
import TailwindPreview from './TailwindPreview.vue';
import RenderlessExample from './RenderlessExample.vue';
import DiceRoller from '../src/components/DiceRoller.vue';
</script>

<template>
  <header class="page-header">
    <h1>RPG Dice Roller</h1>
    <p>Try the components with their own styles.</p>
  </header>
  <main class="demo-grid">
    <section class="demo-card">
      <header>
        <h2>Tailwind</h2>
        <p>Styled with Tailwind CSS 3.</p>
      </header>
      <TailwindPreview />
    </section>
    <section class="demo-card">
      <header>
        <h2>Bootstrap</h2>
        <p>Styled with Bootstrap 5.</p>
      </header>
      <BootstrapPreview />
    </section>
    <section class="demo-card">
      <header>
        <h2>Plain HTML</h2>
        <p>The component without a CSS framework.</p>
      </header>
      <div class="plain-preview"><DiceRoller notation="4d6" /></div>
    </section>
    <section class="demo-card">
      <header>
        <h2>Renderless</h2>
        <p>Custom markup using the renderless component and Tailwind.</p>
      </header>
      <TailwindPreview><RenderlessExample /></TailwindPreview>
    </section>
  </main>
</template>
