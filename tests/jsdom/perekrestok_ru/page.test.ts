import {initProductPage, initCatalog} from '../../../src/best_price/sites/perekrestok_ru';
import {CleanUpCallback, displayHtmlInBrowser, prepareJsdomSnapshot} from '../helpers';


describe('jsdom perekrestok.ru', () => {
  describe('Check catalog', () => {
    let cleanup: CleanUpCallback
    beforeEach(async () => {
      cleanup = await prepareJsdomSnapshot('perekrestok.ru', 'page');
    });
    afterEach(() => {
      cleanup()
    })
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('Перекрёстке');
    });
    it('Checks main price', async () => {
      initProductPage();
      expect(
        document.querySelector('.product-price-wrapper .GM-best-price'),
      ).toBeTruthy();
    });
    it('Checks recommends block', async () => {
      initCatalog();
      expect(
        document.querySelector('.swiper-slide .GM-best-price'),
      ).toBeTruthy();
    });
  });
});
