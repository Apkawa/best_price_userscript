import {initProductPage} from '../../../src/best_price/sites/wildberries_ru';
import {prepareJsdom} from '../helpers';

describe('jsdom wildberries.ru', () => {
  describe('Check catalog', () => {
    beforeEach(async () => {
      await prepareJsdom({
        path: require.resolve('./page.html'),
        url: 'https://www.wildberries.ru/catalog/34640737/detail.aspx',
      });
    });
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('WildBerries.ru');
    });
    it('Checks main price', async () => {
      initProductPage();
      expect(
        document.querySelector('.product-page .GM-best-price')
      ).toBeTruthy()
    });
    it('Checks recommends block', async () => {
      initProductPage();
      expect(
        document.querySelector('.j-products-container .GM-best-price')
      ).toBeTruthy()
    });
  });
});
