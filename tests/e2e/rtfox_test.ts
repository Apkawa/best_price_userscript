import { test as baseTest } from "@playwright/test";
import { Browser } from "playwright";
import { RTFoxManager } from "../helpers/rtfox";
import { projectRoot } from "../helpers/path_dirs";
import path from "path";

interface RTFoxContext {
  rtfox: RTFoxManager;
  browser: Browser;
}

export const test = baseTest.extend<{}, RTFoxContext>({
  // Запуск менеджера и браузера
  rtfox: [
    async ({}, use) => {
      const manager = new RTFoxManager({
        port: 9222,
        profileDir: path.resolve(projectRoot(), "test-tools/profiles/__rtfox_profile"),
      });

      try {
        await use(manager);
      } finally {
        await manager.stop();
      }
    },
    { scope: "worker" },
  ],

  browser: [
    async ({ rtfox }, use) => {
      const browser = await rtfox.start();
      try {
        await use(browser);
      } finally {
        await rtfox.stop();
      }
    },
    { scope: "worker" },
  ],

  // Использование готового rtfox-контекста
  context: async ({ browser }, use) => {
    const context = browser.contexts()[0];
    await use(context);
    // Для CDP-контекстов закрытие обычно делает сам менеджер, но оставим для порядка
    await context.close().catch(() => {});
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from "@playwright/test";
