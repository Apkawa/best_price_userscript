import {defineConfig} from 'playwright/test';

defineConfig({
  testDir: './tests/e2e/',
  timeout: 300000,
  fullyParallel: false, // Для тяжелых E2E с антидетектом лучше гонять по очереди
  workers: 1,           // На старте лучше выставить 1 воркер, чтобы не перегружать CPU Камуфляжем
  reporter: 'list',

  use: {
    // Базовые настройки Playwright оставляем тут
    screenshot: 'only-on-failure',
  },

  // Убираем массив projects, чтобы выполнялся ровно один запуск,
  // так как наш кастомный browser fixture сам решит, что запускать Camoufox
});
