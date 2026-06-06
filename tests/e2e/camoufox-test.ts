import { Camoufox } from "camoufox-js";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { exec } from "node:child_process";
const execute = util.promisify(exec);

import { launchOptions } from "camoufox-js";
import { test as baseTest } from "@playwright/test";
import { firefox } from "playwright-core";

const WIDTH = 1280;
const HEIGHT = 720;

// Расширяем стандартный тип тест-контекста Playwright
export const test = baseTest.extend({
  // // Переопределяем стандартный браузер
  // browser: async ({}, use) => {

  //   // Передаем Camoufox дальше в тесты Playwright
  //   await use(browser);

  //   // Закрываем после окончания теста
  //   await browser.close();
  // },

  // 2. ПЕРЕОПРЕДЕЛЯЕМ КОНТЕКСТ: передаем его в тесты со всеми настройками
  context: async ({}, use) => {
    const userDir = "/home/apkawa/code/best_price_userscript/tests/e2e/__camofox-profile/";
    const fingerprintFile = path.join(userDir, `fingerprint.json`);
    let fingerprint;

    const options = {
      // https://github.com/daijro/camoufox/blob/main/pythonlib/camoufox/utils.py https://github.com/apify/camoufox-js/blob/master/src/utils.ts#L310
      os: "windows",
      // geoip: true,
      humanize: 0.5,
      headless: false,
      debug: false,
      timeout: 60 * 1000,
      enable_cache: true,
      persistent_context: true, // https://camoufox.com/python/usage/#persistent-context
      user_data_dir: userDir,
      locale: "ru-RU",
      viewport: { width: WIDTH, height: HEIGHT },
    };
    const isNew = !fs.existsSync(fingerprintFile);
    if (isNew) {
      fingerprint = structuredClone(await launchOptions(options));
      if (!fs.existsSync(userDir)) await fs.promises.mkdir(userDir, { recursive: true });
      await fs.promises.writeFile(fingerprintFile, JSON.stringify(fingerprint, null, `\t`));
    } else {
      fingerprint = JSON.parse(await fs.promises.readFile(fingerprintFile, `utf8`));
    }
    fingerprint.env = {
      ...fingerprint.env,
      ...process.env, // Be sure to replace the old env with the current one. We save the env because launchOptions adds keys with fingerprint data there when creating a new profile.
    };

    const browserCtx = await firefox.launchPersistentContext(
      // https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context
      userDir,
      { ...fingerprint, ...options },
    );

    // Передаем настроенный контекст дальше в тест-раннер Playwright
    await use(browserCtx);

    // Закрываем контекст после завершения теста
    await browserCtx.close();
  },

  // Автоматически переопределяем context и page, чтобы они наследовались от Camoufox
  page: async ({ context }, use) => {
    const page = await context.newPage();

    await use(page);

    await context.close();
  },
});

export { expect } from "@playwright/test";
