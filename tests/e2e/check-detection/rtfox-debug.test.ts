import { test, chromium, expect } from "@playwright/test";

test.skip("test ozon detection via rtfox", async () => {
  // 0. Где нибудь запускаем `uv run tests/e2e/rtfox-test.py`
  // 1. Подключаемся к rtfox-browser по отладочному порту
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");

  // 2. Берем контекст rtfox (где куки, профиль и нет флагов автоматизации Playwright)
  const defaultContext = browser.contexts()[0];

  // 3. Используем уже открытую вкладку (или создаем новую внутри rtfox)
  const page = defaultContext.pages()[0] || (await defaultContext.newPage());

  // 4. Переходим на Озон
  await page.goto("https://ozon.ru", {
    waitUntil: "domcontentloaded",
  });

  // ВАЖНО: Убираем waitForNetworkIdle, так как метрики Ozon могут слать бесконечные запросы
  // Вместо этого ждем 3 секунды, пока rtfox автоматом пролетит капчу
  await page.waitForTimeout(3000);

  // Проверяем тайтл
  await expect(page).toHaveTitle("OZON маркетплейс – миллионы товаров по выгодным ценам");
});
