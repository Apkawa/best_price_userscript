import {equal} from 'node:assert';
import {describe, it} from 'node:test';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';
import {expect} from 'playwright/test';
import '@tests/test_utils/globalHooks';

import {initCatalog, initProductPage} from '@/best_price/sites/lenta_com';

describe('jsdom lenta.com', () => {
  describe('Check page', () => {
    prepareJsdomSnapshotHook('lenta.com', 'page');

    it('Page content', () => {
      expect(document.querySelector('title')?.textContent).toMatch('');
    });
    it('Checks main price', async () => {
      await initProductPage();
      expect(document.querySelector('lu-product-page-info .GM-best-price')).toBeTruthy();
    });
    it('Checks multiple call', async () => {
      await initProductPage();
      await initProductPage();
      equal(document.querySelectorAll('lu-product-page-info .GM-best-price').length, 1);
    });
    it('Checks recommends block', async () => {
      await initCatalog();
      expect(document.querySelector('lu-product-alternative .GM-best-price')).toBeTruthy();
    });
  });
});
