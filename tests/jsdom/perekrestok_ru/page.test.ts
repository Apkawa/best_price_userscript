import {describe, it} from 'node:test';
import {expect} from 'playwright/test';
import '@tests/test_utils/globalHooks';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';

import {initProductPage} from '@/best_price/sites/wildberries_ru';


describe.skip('jsdom perekrestok.ru', () => {
  describe('Check catalog', () => {
    prepareJsdomSnapshotHook('example.com', 'page');

    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('');
    });
    it('Checks main price', async () => {
      initProductPage();
      expect(
        document.querySelector('.product-page .GM-best-price'),
      ).toBeTruthy();
    });
    it('Checks recommends block', async () => {
      initProductPage();
      expect(
        document.querySelector('.j-products-container .GM-best-price'),
      ).toBeTruthy();
    });
  });
});
