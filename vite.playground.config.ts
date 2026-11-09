import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: fileURLToPath(new URL('./playground', import.meta.url)),
  base: './',
  plugins: [vue()],
  build: {
    outDir: '../playground-dist',
    emptyOutDir: true,
  },
});
