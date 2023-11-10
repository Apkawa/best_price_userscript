import {initProductPage, initCatalog} from '../../../src/best_price/sites/ozon_ru';
import {CleanUpCallback, displayHtmlInBrowser, prepareJsdomSnapshot} from '../helpers';


describe('jsdom ozon.ru', () => {
  describe('Check page', () => {
    let cleanup: CleanUpCallback
    beforeEach(async () => {
      cleanup = await prepareJsdomSnapshot('ozon.ru', 'page');
    });
    afterEach(async () => {
      // For debug
      // await displayHtmlInBrowser(document)
      cleanup()
    })
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('');
    });
    it('Checks main price', async () => {
      initProductPage();
      expect(
        document.querySelector('[data-widget="webPrice"] .GM-best-price'),
      ).toBeTruthy();
    });
    it('Checks multiple call', async () => {
      initProductPage();
      initProductPage();
      initProductPage();
      expect(
        document.querySelectorAll('[data-widget="webPrice"] .GM-best-price').length == 1,
      ).toBeTruthy();
    });
    it('Checks recommends block', async () => {
      initCatalog();
      expect(
        document.querySelector('[data-widget="skuShelfGoods"] .GM-best-price'),
      ).toBeTruthy();
    });
  });
});
