import {initPopup, initProductPage} from '../../../src/best_price/sites/wildberries_ru';
import {CleanUpCallback, displayHtmlInBrowser, prepareJsdomSnapshot} from '../helpers';

describe('jsdom wildberries.ru', () => {
  describe('Check catalog', () => {
    let cleanup: CleanUpCallback
    beforeEach(async () => {
      cleanup = await prepareJsdomSnapshot('wildberries.ru', 'popup');
    });
    afterEach(() => {
      cleanup()
    })
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('Wildberries');
    });
    it('Checks main price', async () => {
      initPopup();
      // await displayHtmlInBrowser(document)
      expect(
        document.querySelector('.popup .GM-best-price'),
      ).toBeTruthy();
    });
  });
});
