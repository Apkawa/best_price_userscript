import {test, expect} from 'playwright/test';


import {
  prepareAndGoTo,
  waitForSelectorAndGetElementInfo,
  waitForSelectorAndGetTextContent,
} from '../helpers';

test.describe('ozon.ru', () => {
  test.describe('Check catalog', () => {
    test.beforeEach(async ({page}) => {
      await prepareAndGoTo(page, 'https://www.ozon.ru/category/masla-9354/');
    });
    test('Page content', async ({page}) => {
      const html = await page.content();
      expect(await page.title()).toMatch('OZON');
      expect(html).toMatch('OZON');
    });

    test('Check buttons', async ({page}) => {
      const el = await waitForSelectorAndGetTextContent(page, '.GM-best-price-button-wrap');
      expect(el).toMatch('Resetby Weightby Quantity');
    });

    test('Checks price', async ({page}) => {
      const el = await waitForSelectorAndGetElementInfo(page,
        '.widget-search-result-container .GM-best-price');
      expect(el?.textContent).toBeTruthy();
    });

  });
});


