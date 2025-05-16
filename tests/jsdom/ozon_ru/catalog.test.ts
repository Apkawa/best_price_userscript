import {describe, it} from 'node:test';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';
import {expect} from 'playwright/test';
import '@tests/test_utils/globalHooks';

import {initCatalog} from '@/best_price/sites/ozon_ru';

describe('jsdom ozon.ru', () => {
  describe('Check catalog', () => {
    prepareJsdomSnapshotHook('ozon.ru', 'catalog');

    it('Page content', () => {
      expect(document.querySelector('title')?.textContent).toMatch('OZON');
    });

    it('Check buttons', async () => {
      initCatalog();
      expect(document.querySelector('.GM-best-price-button-wrap')).toBeTruthy();
    });

    it('Checks price', async () => {
      initCatalog();
      expect(document.querySelector('.widget-search-result-container .GM-best-price')).toBeTruthy();
    });
  });
});
