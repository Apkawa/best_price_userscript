import {describe, it} from 'node:test';
import {expect} from 'playwright/test';
import '@tests/test_utils/globalHooks';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';

import {initProductPage} from '@/best_price/sites/wildberries_ru';

describe('jsdom wildberries.ru', () => {
  describe('Check catalog', () => {
    prepareJsdomSnapshotHook('wildberries.ru', 'page');

    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('Wildberries');
    });
    it('Checks main price', async () => {
      initProductPage();
      expect(
        document.querySelector('.product-page .GM-best-price'),
      ).toBeTruthy();
    });
    it.skip('Checks recommends block', async () => {
      initProductPage();
      expect(
        document.querySelector('.cards-list__container .GM-best-price'),
      ).toBeTruthy();
    });
  });
});
