<script setup lang="ts">
import DiceRollerTailwind from '../src/components/DiceRollerTailwind.vue';
</script>

<template>
  <div class="tailwind-preview">
    <slot><DiceRollerTailwind notation="4d6" /></slot>
  </div>
</template>

<style src="./styles/tailwind.css"></style>
