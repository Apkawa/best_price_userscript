import {initCatalog} from '../../../src/best_price/sites/lenta_com';
import {CleanUpCallback, prepareJsdomSnapshot} from '../helpers';

describe('jsdom lenta.com', () => {
  describe('Check catalog', () => {
    let cleanup: CleanUpCallback;
    beforeEach(async () => {
      cleanup = await prepareJsdomSnapshot('lenta.com', 'catalog');
    });
    afterEach(() => {
      cleanup()
    })
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('Лента');
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
