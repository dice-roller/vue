import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import vue from 'eslint-plugin-vue';
import globals from 'globals';

export default defineConfig([
  globalIgnores([
    'dist/**',
    'dist-ssr/**',
    'coverage/**',
    'playground-dist/**',
    'test-results/**',
    'playwright-report/**',
  ]),
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    files: [
      'src/**/*.{js,vue}',
      'playground/**/*.{js,vue}',
      'tests/browser/**/*.js',
    ],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.js', '*.cjs', 'tests/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  prettier,
]);
