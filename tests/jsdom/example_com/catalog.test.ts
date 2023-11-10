import {initCatalog} from '../../../src/best_price/sites/wildberries_ru';
import {CleanUpCallback, prepareJsdomSnapshot, displayHtmlInBrowser} from '../helpers';

describe.skip('jsdom wildberries.ru', () => {
  describe('Check catalog', () => {
    let cleanup: CleanUpCallback;
    beforeEach(async () => {
      cleanup = await prepareJsdomSnapshot('example.com', 'catalog');
    });
    afterEach(async () => {
      // For debug
      await displayHtmlInBrowser(document)
      cleanup()
    })
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('WildBerries.ru');
    });
    it('Check buttons', async () => {
      initCatalog();
      // For debug
      await displayHtmlInBrowser(document)
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
