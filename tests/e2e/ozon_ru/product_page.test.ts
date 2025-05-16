import {expect, test} from 'playwright/test';

import {autoScroll, prepareAndGoTo, waitForSelectorAndGetTextContent} from '../helpers';

test.describe('ozon.ru', () => {
  // TODO исправить мигающий тест
  test.describe.skip('Check product page', () => {
    test.beforeAll(async ({page}) => {
      await prepareAndGoTo(
        page,
        'https://www.ozon.ru/product/' +
          'perlovaya-krupa-v-paketikah-dlya-varki-uvelka-400-g-138235083/',
      );
    });
    test('Page content', async ({page}) => {
      const html = await page.content();
      expect(await page.title()).toMatch('OZON');
      expect(html).toMatch('OZON');
    });
    test('Check main price', async ({page}) => {
      const el = await waitForSelectorAndGetTextContent(
        page,
        'div[data-widget="webPrice"]  .GM-best-price',
      );
      expect(el).toBeTruthy();
    });

    // TODO
    test.skip('Checks recommends', async ({page}) => {
      await autoScroll(page);
      const el = await waitForSelectorAndGetTextContent(
        page,
        'div[data-widget="skuShelfGoods"] .GM-best-price',
      );
      expect(el).toBeTruthy();
    });
  });
});
