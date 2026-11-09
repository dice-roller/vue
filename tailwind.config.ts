import type { Config } from 'tailwindcss';

export default {
  content: [
    './playground/**/*.{html,vue,ts}',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
