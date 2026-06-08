import { waitForNetworkIdle } from "@tests/jsdom/helpers";
import { expect, test } from "../rtfox_test";

test.describe("detection", async () => {
  test.skip("browserscan bot-detection", async ({ page }) => {
    await page.goto("https://bot.sannysoft.com/", {
      // waitUntil: "domcontentloaded",
    });
    // await waitForNetworkIdle(page, { maxInflightRequests: 5 });
    // const selector = '[class^="HeroSection-module--botSubTitle--"]';
    // await page.waitForFunction(
    //   (selector) => document.querySelector(selector)?.innerHTML !== "Bot detection in progress",
    //   selector,
    // );

    await page.pause();
    // await expect(page.locator(selector)).toHaveText("You are not a bot");
  });

  test("test ozon detection", async ({ page }) => {
    await page.goto("https://www.ozon.ru/", {
      waitUntil: "domcontentloaded",
    });
    await waitForNetworkIdle(page, { maxInflightRequests: 0 });
    // await page.pause();
    await expect(page).toHaveTitle("OZON маркетплейс – миллионы товаров по выгодным ценам");
  });
});
