import {initProductPage} from '../../../src/best_price/sites/wildberries_ru';
import {CleanUpCallback, prepareJsdomSnapshot} from '../helpers';

describe('jsdom wildberries.ru', () => {
  describe('Check catalog', () => {
    let cleanup: CleanUpCallback
    beforeEach(async () => {
      cleanup = await prepareJsdomSnapshot('wildberries.ru', 'page');
    });
    afterEach(() => {
      cleanup()
    })
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('Wildberries');
    });
    it('Checks main price', async () => {
      initProductPage();
      expect(
        document.querySelector('.product-page .GM-best-price'),
      ).toBeTruthy();
    });
    it('Checks recommends block', async () => {
      initProductPage();
      expect(
        document.querySelector('.j-products-container .GM-best-price'),
      ).toBeTruthy();
    });
  });
});
