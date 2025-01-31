import {describe, it} from 'node:test';
import {expect} from 'playwright/test';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';
import '@tests/test_utils/globalHooks';

import {initCatalog} from '@/best_price/sites/wildberries_ru';


// !!! remove .skip
describe.skip('jsdom example.com', () => {
  prepareJsdomSnapshotHook('example.com', 'catalog');
  describe('Check catalog', () => {

    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('WildBerries.ru');
    });
    it('Check buttons', async () => {
      initCatalog();
      // For debug
      // await displayHtmlInBrowser(document);
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
