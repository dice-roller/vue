<script setup>
import { usePreferredDark } from '@vueuse/core';
import DiceRollerBootstrap from '../src/components/DiceRollerBootstrap.vue';

const prefersDark = usePreferredDark();
</script>

<template>
  <div
    class="bootstrap-preview"
    :data-bs-theme="prefersDark ? 'dark' : 'light'"
  >
    <DiceRollerBootstrap notation="4d6" />
  </div>
</template>

<style src="./styles/bootstrap.css"></style>
