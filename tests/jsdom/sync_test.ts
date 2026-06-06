import { RTFoxManager } from "../helpers/rtfox";
(async () => {
  const rtfox = new RTFoxManager({
    port: 9222, // можно кастомизировать порты, чтобы не пересекаться с тестами
  });

  try {
    const browser = await rtfox.start();
    const context = browser.contexts()[0];
    const page = await context.newPage();
    await page.goto("https://ozon.ru", {
      waitUntil: "domcontentloaded",
    });

    // ВАЖНО: Убираем waitForNetworkIdle, так как метрики Ozon могут слать бесконечные запросы
    // Вместо этого ждем 3 секунды, пока rtfox автоматом пролетит капчу
    await page.waitForTimeout(3000);
  } finally {
    rtfox.stop();
  }
})();
