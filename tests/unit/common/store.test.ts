import {
  loadParsedTitleFromElement,
  storeParsedTitleToElement
} from '../../../src/best_price/common/store';
import {ParseTitlePriceResult} from '../../../src/best_price/common/parseTitle';

describe('storeParsedTitleToElement', () => {
  test('generic', () => {
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
  test('with units', () => {
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
  test('generic', () => {
    const el = document.createElement('div');
    const ds1 = {
      quantity: 1,
      quantity_price: 100,
      quantity_price_display: '100 руб',
      units: [],
    };
    storeParsedTitleToElement(el, ds1);
    const ds2 = loadParsedTitleFromElement(el);
    expect(ds1).toStrictEqual(ds2);
  });
  test('with units', () => {
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
    expect(ds1).toStrictEqual(ds2);
  });
});
