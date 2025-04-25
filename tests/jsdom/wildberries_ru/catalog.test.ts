import {describe, it} from 'node:test';
import {expect} from 'playwright/test';
import '@tests/test_utils/globalHooks';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';

import {initCatalog} from '@/best_price/sites/wildberries_ru';

describe('jsdom wildberries.ru', () => {
  describe('Check catalog', () => {
    prepareJsdomSnapshotHook('wildberries.ru', 'catalog');

    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('WildBerries.ru');
    });
    it('Check buttons', async () => {
      initCatalog();
      expect(document.querySelector('.GM-best-price-button-wrap')).toBeTruthy();
    });
    it('Checks price', async () => {
      initCatalog();
      expect(
        document.querySelector('.GM-best-price')
      ).toBeTruthy()
    });
  });
});
