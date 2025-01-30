import {describe, it} from 'node:test';
import {expect} from '@tests/test_utils/expect';
import {jsdomHook} from '@tests/test_utils/jsdom/hooks';

import {
  loadParsedTitleFromElement,
  storeParsedTitleToElement
} from '@/best_price/common/store';
import {ParseTitlePriceResult} from '@/best_price/common/parseTitle';



describe('storeParsedTitleToElement', () => {
  jsdomHook()
  it('generic', () => {
    const el = document.createElement('div');
    storeParsedTitleToElement(el, {
      quantity: 1,
      quantity_price: 100,
      quantity_price_display: '100 руб',
      units: [],
    });
    expect(Object.fromEntries(Object.entries(el.dataset))).toStrictEqual({
      bp_quantity: '1',
      bp_quantity_price: '100',
      bp_quantity_price_display: '"100 руб"',
      bp_units: '[]',
    });
  });
  it('with units', () => {
    const el = document.createElement('div');
    storeParsedTitleToElement(el, {
      quantity: 1,
      quantity_price: 100,
      quantity_price_display: '100 руб',
      units: [
        {
          unit: 'кг',
          value: 2,
          total: 2,
          price: 50,
          price_display: '50 руб',
        },
      ],
    });
    expect(Object.fromEntries(Object.entries(el.dataset))).toStrictEqual({
      bp_quantity: '1',
      bp_quantity_price: '100',
      bp_quantity_price_display: '"100 руб"',
      bp_units: '[{"unit":"кг","value":2,"total":2,"price":50,"price_display":"50 руб"}]',
    });
  });
});

describe('loadParsedTitleFromElement', () => {
  jsdomHook()
  it('generic', () => {
    const el = document.createElement('div');
    const ds1 = {
      quantity: 1,
      quantity_price: 100,
      quantity_price_display: '100 руб',
      units: [],
    };
    storeParsedTitleToElement(el, ds1);
    const ds2 = loadParsedTitleFromElement(el);
    expect(ds2).toStrictEqual(ds1);
  });
  it('with units', () => {
    const el = document.createElement('div');
    const ds1: ParseTitlePriceResult = {
      quantity: 1,
      quantity_price: 100,
      quantity_price_display: '100 руб',
      units: [
        {
          unit: 'кг',
          value: 2,
          total: 2,
          price: 50,
          price_display: '50 руб',
        },
      ],
    };
    storeParsedTitleToElement(el, ds1);
    const ds2 = loadParsedTitleFromElement(el);
    expect(ds2).toStrictEqual(ds1);
  });
});
