<script setup lang="ts">
import { usePreferredDark } from '@vueuse/core';
import DiceRollerBootstrap from '../src/components/DiceRollerBootstrap.vue';
import type { RollInputData } from '@dice-roller/rpg-dice-roller';

defineProps<{ data?: RollInputData }>();

const prefersDark = usePreferredDark();
</script>

<template>
  <div
    class="bootstrap-preview"
    :data-bs-theme="prefersDark ? 'dark' : 'light'"
  >
    <DiceRollerBootstrap notation="4d6" :data="data" />
  </div>
</template>

<style src="./styles/bootstrap.css"></style>
