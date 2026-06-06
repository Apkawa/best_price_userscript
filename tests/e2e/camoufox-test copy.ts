import { test as baseTest } from "@playwright/test";
import { Camoufox } from "camoufox-js";

const WIDTH = 1280;
const HEIGHT = 720;

// Расширяем стандартный тип тест-контекста Playwright
export const test = baseTest.extend({
  // // Переопределяем стандартный браузер
  // browser: async ({}, use) => {
  //   // Запускаем Camoufox. Он возвращает стандартный экземпляр Browser из Playwright
  //   const camoufoxBrowser = await Camoufox({
  //     persistent_context: true,
  //     user_data_dir: "/home/user/projects/ai-studio-api/profile",
  //     headless: false, // Меняйте на false, если хотите видеть окно
  //     // Здесь можно передать кастомный OS фингерпринт, языки, прокси и т.д.
  //     os: 'windows',
  //     humanize: true,
  //     locale: "ru-RU",
  //     // block_webrtc: true,
  //     // block_webgl: true,
  //     // disable_coop: true,
  //   });

  //   // Передаем Camoufox дальше в тесты Playwright
  //   await use(camoufoxBrowser);

  //   // Закрываем после окончания теста
  //   await camoufoxBrowser.close();
  // },

  // 2. ПЕРЕОПРЕДЕЛЯЕМ КОНТЕКСТ: передаем его в тесты со всеми настройками
  context: async ({ browser }, use) => {
    // Создаем контекст и жестко фиксируем вьюпорт для адаптивной верстки сайтов
    const camoufoxContext = await Camoufox({
      persistent_context: true,
      user_data_dir: "/home/apkawa/code/best_price_userscript/tests/e2e/__camofox-profile/",
      headless: false, // Меняйте на false, если хотите видеть окно
      // Здесь можно передать кастомный OS фингерпринт, языки, прокси и т.д.
      os: "windows",
      humanize: true,
      locale: "ru-RU",
      viewport: { width: WIDTH, height: HEIGHT },
      // block_webrtc: true,
      // block_webgl: true,
      // disable_coop: true,
    });

    // Передаем настроенный контекст дальше в тест-раннер Playwright
    await use(camoufoxContext);

    // Закрываем контекст после завершения теста
    await camoufoxContext.close();
  },

  // Автоматически переопределяем context и page, чтобы они наследовались от Camoufox
  page: async ({ context }, use) => {
    const page = await context.newPage();

    await use(page);

    await context.close();
  },
});

export { expect } from "@playwright/test";
