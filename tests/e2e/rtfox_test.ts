import { test as baseTest } from "@playwright/test";
import type { Browser } from "playwright";
import { RTFoxManager } from "../helpers/rtfox";
import { projectRoot } from "../helpers/path_dirs";
import path from "node:path";

interface RTFoxContext {
  rtfox: RTFoxManager;
  browser: Browser;
}

let manager: RTFoxManager | null;
let browser: Browser | null;

export const test = baseTest.extend<{}, RTFoxContext>({
  // Запуск менеджера и браузера
  rtfox: [
    async ({}, use) => {
      if (!manager) {
        manager = new RTFoxManager({
          port: 9222,
          profileDir: path.resolve(projectRoot(), "test-tools/profiles/__rtfox_profile"),
        });
      }

      await use(manager);
      // await manager.stop();
    },
    { scope: "worker" },
  ],

  browser: [
    async ({ rtfox }, use) => {
      const browser = await rtfox.start();
      await use(browser);
      // await rtfox;
    },
    { scope: "worker" },
  ],

  // Использование готового rtfox-контекста
  context: async ({ browser }, use) => {
    const context = browser.contexts()[0];
    await use(context);
    // Для CDP-контекстов закрытие обычно делает сам менеджер, но оставим для порядка
    // await context.close().catch(() => {});
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

test.afterAll(async () => {
  console.log("afterAll STOP MANAGER");
  await manager?.stop();
  await browser?.close();
  manager = null;
  browser = null;
});

export { expect } from "@playwright/test";
