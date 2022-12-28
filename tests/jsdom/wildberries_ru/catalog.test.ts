import {initCatalog} from '../../../src/best_price/sites/wildberries_ru';
import {prepareJsdom} from '../helpers';

describe('jsdom wildberries.ru', () => {
  describe('Check catalog', () => {
    beforeEach(async () => {
      await prepareJsdom({
        path: require.resolve('./catalog.html'),
        url: 'https://www.wildberries.ru/catalog/pitanie/chay-kofe/kofe#c34640737',
      });
    });
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
