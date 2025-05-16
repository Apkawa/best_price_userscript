import {describe, it} from 'node:test';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';
import {expect} from 'playwright/test';
import '@tests/test_utils/globalHooks';

import {initCatalog, initProductPage} from '@/best_price/sites/ozon_ru';

describe('jsdom ozon.ru', () => {
  describe('Check page', () => {
    prepareJsdomSnapshotHook('ozon.ru', 'page');
    it('Page content', () => {
      expect(document.querySelector('title')?.textContent).toMatch('');
    });
    it('Checks main price', async () => {
      initProductPage();
      expect(document.querySelector('[data-widget="webPrice"] .GM-best-price')).toBeTruthy();
    });
    it('Checks multiple call', async () => {
      initProductPage();
      initProductPage();
      initProductPage();
      expect(
        document.querySelectorAll('[data-widget="webPrice"] .GM-best-price').length == 1,
      ).toBeTruthy();
    });
    it('Checks recommends block', async () => {
      initCatalog();
      expect(document.querySelector('[data-widget="skuShelfGoods"] .GM-best-price')).toBeTruthy();
    });
  });
});
