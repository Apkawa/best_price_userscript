import {describe, it} from 'node:test';
import {expect} from 'playwright/test';
import '@tests/test_utils/globalHooks';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';

import {initPopup, initProductPage} from '@/best_price/sites/wildberries_ru';

describe('jsdom wildberries.ru', () => {
  describe('Check catalog', () => {
    prepareJsdomSnapshotHook('wildberries.ru', 'popup');

    it('Page content', () => {
      expect(document.querySelector('title')?.textContent).toMatch('Wildberries');
    });
    it('Checks main price', async () => {
      initPopup();
      // await displayHtmlInBrowser(document)
      expect(document.querySelector('.popup .GM-best-price')).toBeTruthy();
    });
  });
});
