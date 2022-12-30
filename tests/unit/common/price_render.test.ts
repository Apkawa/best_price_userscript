import {renderBestPrice} from '../../../src/best_price/common/price_render';
import {ParseTitlePriceResult} from '../../../src/best_price/common/parseTitle';

describe('price_render', () => {
  test('render generic', () => {
    const titleInfo: ParseTitlePriceResult = {
      'quantity': 2,
      'units': [],
      'quantity_price': 100,
      'quantity_price_display': '100 ₽/шт',
    };
    const el = renderBestPrice(titleInfo);
    expect(el.outerHTML).toStrictEqual('<div class="GM-best-price" ' +
      'style="border: 1px solid red; padding: 5px; margin: 5px;">' +
      '<p>100 ₽/шт</p></div>');
  });

  test('render empty', () => {
    const titleInfo: ParseTitlePriceResult = {
      'quantity': 1,
      'units': [],
      'quantity_price': null,
      'quantity_price_display': null,
    };
    const el = renderBestPrice(titleInfo);
    expect(el.outerHTML).toStrictEqual('<div class="GM-best-price"></div>');
  });
  test('render extra style', () => {
    const titleInfo: ParseTitlePriceResult = {
      'quantity': 2,
      'units': [],
      'quantity_price': 100,
      'quantity_price_display': '100 ₽/шт',
    };
    const el = renderBestPrice(titleInfo, {fontSize: '10px'});
    expect(el.getAttribute('style'))
      .toStrictEqual('border: 1px solid red; ' +
        'padding: 5px; margin: 5px; font-size: 10px;');
  });

  test('render units', () => {
    const titleInfo: ParseTitlePriceResult = {
      'quantity': 1,
      'units': [{
        'unit': 'кг', 'value': 0.9,
        'total': 0.9, 'price': 111.1,
        'price_display': '111.1 ₽/кг',
      }],
      'quantity_price': null,
      'quantity_price_display': null,
    };
    const el = renderBestPrice(titleInfo);
    expect(el.innerHTML).toStrictEqual('<p>111.1 ₽/кг</p>');
  });

  test('render units with quantity', () => {
    const titleInfo: ParseTitlePriceResult = {
      'quantity': 3,
      'units': [{
        'unit': 'кг', 'value': 0.9,
        'total': 0.9, 'price': 111.1,
        'price_display': '111.1 ₽/кг',
      }],
      'quantity_price': 200,
      'quantity_price_display': '200 ₽/шт',
    };
    const el = renderBestPrice(titleInfo);
    expect(el.innerHTML).toStrictEqual(
      '<p>111.1 ₽/кг</p>' +
      '<p>200 ₽/шт</p>');
  });
});
