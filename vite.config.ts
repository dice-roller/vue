import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  // Copy declaration module metadata using Vite's standard public assets support.
  publicDir: fileURLToPath(new URL('./declarations', import.meta.url)),
  build: {
    target: ['chrome107', 'edge107', 'firefox104', 'safari16'],
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'DiceRollerVue',
      fileName: 'vue',
    },
    rolldownOptions: {
      external: ['vue', '@dice-roller/rpg-dice-roller'],
      output: {
        globals: {
          vue: 'Vue',
          '@dice-roller/rpg-dice-roller': 'rpgDiceRoller',
        },
      },
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
