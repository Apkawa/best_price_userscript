import {afterEach, describe, it} from 'node:test';
import {expect} from 'playwright/test';
import {prepareJsdomSnapshotHook} from '@tests/test_utils/jsdom/hooks';
import '@tests/test_utils/globalHooks';

import {initCatalog} from '@/best_price/sites/lenta_com';
import {displayHtmlInBrowser} from '@tests/jsdom/helpers';

describe('jsdom Lenta.com', () => {
  describe('Check catalog', () => {
    prepareJsdomSnapshotHook('lenta.com', 'catalog');
    it('Page content', () => {
      expect(
        document.querySelector('title')?.textContent).toMatch('Лента');
    });
    it('Check buttons', async () => {
      initCatalog();
      // await displayHtmlInBrowser()
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
