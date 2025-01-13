/**
 * // TODO
 * @jest-environment jest-playwright
 */


import {
  prepareAndGoTo,
  waitForSelectorAndGetElementInfo,
  waitForSelectorAndGetTextContent,
} from '../helpers';

describe('ozon.ru', () => {
  describe('Check catalog', () => {
    beforeAll(async () => {
      await prepareAndGoTo(page, 'https://www.ozon.ru/category/masla-9354/');
    });
    it('Page content', async () => {
      const html = await page.content();
      expect(await page.title()).toMatch('OZON');
      expect(html).toMatch('OZON');
    });

    it('Check buttons', async () => {
      const el = await waitForSelectorAndGetTextContent(page, '.GM-best-price-button-wrap');
      expect(el).toMatch('Resetby Weightby Quantity');
    });

    it('Checks price', async () => {
      const el = await waitForSelectorAndGetElementInfo(page,
        '.widget-search-result-container .GM-best-price');
      expect(el?.textContent).toBeTruthy();
    });

  });
});


