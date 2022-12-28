import {initCatalog} from '../../../src/best_price/sites/ozon_ru';
import {prepareJsdom} from '../helpers';


describe('jsdom ozon.ru', () => {
  describe('Check catalog', () => {
    beforeEach(async () => {
      await prepareJsdom({
        path: require.resolve('./catalog.html'),
        url: 'https://www.ozon.ru/category/korm-dlya-koshek-12348/',
      });
    });
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
        document.querySelector('.widget-search-result-container .GM-best-price')
      ).toBeTruthy()
    });
  });
});


