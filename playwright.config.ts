import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  use: { browserName: 'chromium', colorScheme: 'light' },
  projects: [
    { name: 'dev', use: { baseURL: 'http://127.0.0.1:5174' } },
    { name: 'production', use: { baseURL: 'http://127.0.0.1:4173' } },
  ],
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run preview -- --host 127.0.0.1 --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
