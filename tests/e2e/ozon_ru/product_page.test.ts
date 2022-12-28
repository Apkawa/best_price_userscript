/**
 * @jest-environment jest-environment-puppeteer
 */


import {autoScroll, prepareAndGoTo, waitForSelectorAndGetTextContent} from '../helpers';

describe('ozon.ru', () => {
  // TODO исправить мигающий тест
  describe.skip('Check product page', () => {
    beforeAll(async () => {
      await prepareAndGoTo(page,
        'https://www.ozon.ru/product/' +
        'perlovaya-krupa-v-paketikah-dlya-varki-uvelka-400-g-138235083/');
    });
    it('Page content', async () => {
      const html = await page.content()
      expect(await page.title()).toMatch('OZON');
      expect(html).toMatch('OZON');
    });
    it('Check main price', async () => {
      const el = await waitForSelectorAndGetTextContent(page,
        'div[data-widget="webPrice"]  .GM-best-price');
      expect(el).toBeTruthy();
    });

    // TODO
    it.skip('Checks recommends', async () => {
      await autoScroll(page)
      const el = await waitForSelectorAndGetTextContent(page,
        'div[data-widget="skuShelfGoods"] .GM-best-price');
      expect(el).toBeTruthy();
    });
  });
});
