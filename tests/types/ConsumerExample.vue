<script setup lang="ts">
import { ref } from 'vue';
import type { Roll } from '@dice-roller/rpg-dice-roller';
import {
  DiceRoller,
  DiceRollerBootstrap,
  DiceRollerTailwind,
  DiceRollerRenderless,
} from '@dice-roller/vue';
const notation = ref('4d6');
const onRoll = (_expression: string, result: Roll | null) => result;
</script>

<template>
  <DiceRoller
    v-model:notation="notation"
    :labels="{ copy: 'Copy' }"
    @roll="onRoll"
  >
    <template #button>Throw</template>
  </DiceRoller>
  <DiceRollerTailwind
    :notation="notation"
    @notation:change="notation = $event"
  />
  <DiceRollerBootstrap
    :notation="notation"
    :input-attrs="{ disabled: true }"
    @roll="onRoll"
  />
  <DiceRollerRenderless
    v-slot="{ output, bind, on, copy }"
    :notation="notation"
  >
    <input v-bind="bind" v-on="on" />
    <output>{{ output?.total }}</output>
    <button type="button" @click="copy.copy()">{{ copy.copied }}</button>
  </DiceRollerRenderless>
</template>
