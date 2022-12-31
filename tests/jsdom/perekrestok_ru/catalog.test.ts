import {initCatalog} from '../../../src/best_price/sites/perekrestok_ru';

import {CleanUpCallback, displayHtmlInBrowser, prepareJsdomSnapshot} from '../helpers';

describe('jsdom perekrestok.ru', () => {
  describe('Check catalog', () => {
    let cleanup: CleanUpCallback;
    beforeEach(async () => {
      cleanup = await prepareJsdomSnapshot('perekrestok.ru', 'catalog');
    });
    afterEach(() => {
      cleanup()
    })
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('Перекрёстке');
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
