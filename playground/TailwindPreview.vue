<script setup lang="ts">
import DiceRollerTailwind from '../src/components/DiceRollerTailwind.vue';
import type { RollInputData } from '@dice-roller/rpg-dice-roller';

defineProps<{ data?: RollInputData }>();
</script>

<template>
  <div class="tailwind-preview">
    <slot><DiceRollerTailwind notation="4d6" :data="data" /></slot>
  </div>
</template>

<style src="./styles/tailwind.css"></style>
