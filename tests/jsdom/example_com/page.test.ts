import {describe, it} from 'node:test';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';
import {expect} from 'playwright/test';
import '@tests/test_utils/globalHooks';

import {initProductPage} from '@/best_price/sites/wildberries_ru';

describe.skip('jsdom example.com', () => {
  describe('Check page', () => {
    prepareJsdomSnapshotHook('example.com', 'page');

    it('Page content', () => {
      expect(document.querySelector('title')?.textContent).toMatch('');
    });
    it('Checks main price', () => {
      initProductPage();
      expect(document.querySelector('.product-page .GM-best-price')).toBeTruthy();
    });
    it('Checks multiple call', async () => {
      initProductPage();
      expect(document.querySelectorAll('.product-page .GM-best-price').length == 1).toBeTruthy();
    });
    it('Checks recommends block', async () => {
      initProductPage();
      expect(document.querySelector('.j-products-container .GM-best-price')).toBeTruthy();
    });
  });
});
