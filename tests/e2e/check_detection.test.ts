import {waitForNetworkIdle} from '@tests/jsdom/helpers';
import {expect, test} from 'playwright/test';

test.describe('detection', async () => {
  test('test fingerprint', async ({page}) => {
    await page.goto('https://fingerprint.com/products/bot-detection/', {
      waitUntil: 'domcontentloaded',
    });
    await waitForNetworkIdle(page, {maxInflightRequests: 5});
    const selector = '[class^="HeroSection-module--botSubTitle--"]';
    await page.waitForFunction(
      (selector) => document.querySelector(selector)?.innerHTML !== 'Bot detection in progress',
      selector,
    );

    await expect(page.locator(selector)).toHaveText('You are not a bot');
  });

  test('test ozon detection', async ({page}) => {
    await page.goto('https://www.ozon.ru/', {
      waitUntil: 'domcontentloaded',
    });
    await waitForNetworkIdle(page, {maxInflightRequests: 5});
    await expect(page).toHaveTitle('OZON маркетплейс – миллионы товаров по выгодным ценам');
  });
});
