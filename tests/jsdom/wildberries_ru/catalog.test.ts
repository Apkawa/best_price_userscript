import {initCatalog} from '../../../src/best_price/sites/wildberries_ru';
import {CleanUpCallback, displayHtmlInBrowser, prepareJsdomSnapshot} from '../helpers';

describe('jsdom wildberries.ru', () => {
  describe('Check catalog', () => {
    let cleanup: CleanUpCallback;
    beforeEach(async () => {
      cleanup = await prepareJsdomSnapshot('wildberries.ru', 'catalog');
    });
    afterEach(async () => {
      // For debug
      // await displayHtmlInBrowser(document)
      cleanup()
    })
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('WildBerries.ru');
    });
    it('Check buttons', async () => {
      initCatalog();
      expect(document.querySelector('.GM-best-price-button-wrap')).toBeTruthy();
    });
    it('Checks price', async () => {
      initCatalog();
      expect(
        document.querySelector('.GM-best-price')
      ).toBeTruthy()
    });
  });
});
