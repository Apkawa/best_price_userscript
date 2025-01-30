import {describe, it} from 'node:test';
import {expect} from 'playwright/test';
import '@tests/test_utils/globalHooks';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';

import {initCatalog} from '@/best_price/sites/perekrestok_ru';

describe.skip('jsdom perekrestok.ru', () => {
  describe('Check catalog', () => {
    prepareJsdomSnapshotHook('perekrestok.ru', 'catalog');

    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('WildBerries.ru');
    });
    it('Check buttons', async () => {
      initCatalog();
      // await displayHtmlInBrowser(document)
      expect(document.querySelector('.GM-best-price-button-wrap')).toBeTruthy();
    });
    it('Checks price', async () => {
      initCatalog();
      expect(
        document.querySelector('.GM-best-price'),
      ).toBeTruthy();
    });
  });
});
