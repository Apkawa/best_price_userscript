import {initProductPage} from '../../../src/best_price/sites/lenta_com';
import {CleanUpCallback, prepareJsdomSnapshot} from '../helpers';

// FIX MutationObserver
describe.skip('jsdom lenta.com', () => {
  describe('Check page', () => {
    let cleanup: CleanUpCallback
    beforeEach(async () => {
      cleanup = await prepareJsdomSnapshot('example.com', 'page');
    });
    afterEach(() => {
      cleanup()
    })
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('');
    });
    it('Checks main price', async () => {
      initProductPage();
      expect(
        document.querySelector('.product-page .GM-best-price'),
      ).toBeTruthy();
    });
    it('Checks multiple call', async () => {
      initProductPage();
      expect(
        document.querySelectorAll('.product-page .GM-best-price').length == 1,
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
