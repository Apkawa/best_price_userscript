import {initCatalog} from '../../../src/best_price/sites/ozon_ru';
import {CleanUpCallback, displayHtmlInBrowser, prepareJsdomSnapshot} from '../helpers';


describe('jsdom ozon.ru', () => {
  describe('Check catalog', () => {
    let cleanup: CleanUpCallback
    beforeEach(async () => {
      cleanup = await prepareJsdomSnapshot('ozon.ru', 'catalog');
    });
    afterEach(async () => {
      // For debug
      // await displayHtmlInBrowser(document)
      cleanup()
    })
    it('Page content', () => {
      expect(document.querySelector('title')?.textContent).toMatch('OZON');
    });

    it('Check buttons', async () => {
      initCatalog();
      expect(document.querySelector('.GM-best-price-button-wrap')).toBeTruthy();
    });

    it('Checks price', async () => {
      initCatalog();
      expect(
        document.querySelector('.widget-search-result-container .GM-best-price'),
      ).toBeTruthy();
    });
  });
});


