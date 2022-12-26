import {parseTitle, parseTitleWithPrice} from './parseTitle';

describe('weight', () => {
  test('Extract weight/volume', () => {
    expect(parseTitle('Garnier, 1,5кг')).toStrictEqual({
      quantity: 1,
      units: [{
        total: 1.5,
        value: 1.5,
        unit: 'кг',
      }],
    });

    expect(parseTitle('Сметана Пискаревская, 15%, 200 г')).toStrictEqual({
      quantity: 1,
      units: [{
        total: .2,
        value: .2,
        unit: 'кг',
      }],
    });

    expect(parseTitle('Garnier Банан для очень сухих волос, 390 мл')).toStrictEqual({
      quantity: 1,
      units: [{
        total: .39,
        value: .39,
        unit: 'л',
      }],
    });
    expect(parseTitle('Garnier, 390 грамм')).toStrictEqual({
      quantity: 1,
      units: [{
        total: .39,
        value: .39,
        unit: 'кг',
      }],
    });
  });

  test('extract length', () => {
    expect(parseTitle('Силовой кабель МБ Провод ВВГмб-П нг(А)-LS 3 x 1,5 мм², 10 м'))
      .toStrictEqual({
          quantity: 1,
          units: [{
            total: 10,
            value: 10,
            unit: 'м',
          }],
        },
      );
  });
  test('without unit', () => {
    expect(parseTitle('Aroy-d 70% 17-19%')).toStrictEqual({quantity: 1, units: []});
  });
});
test('Extract quantity', () => {
  expect(parseTitle('Aroy-d 70% жирность 17-19%, 2 шт')).toStrictEqual({
    quantity: 2,
    units: [],
  });
});

describe('Extract quantity and weight', () => {
  test('Common cases', () => {
    expect(parseTitle('Щедрые хлебцы с чесноком 100г/8шт')).toStrictEqual({
      quantity: 8,
      units: [{
        total: .1 * 8,
        value: .1,
        unit: 'кг',
      }],
    });
  });
  test('cases', () => {
    const cases = [
      '80г×5шт',
      '80 г. по 5',
      '5×80 г',
      '5х80 г',
      '80 г x 5 шт',
      '5 шт. по 80 грамм',
      '80 г x 5',
    ];
    for (const title of cases) {
      expect(parseTitle('Рис, ' + title), title).toStrictEqual({
        quantity: 5,
        units: [{total: .08 * 5, value: .08, unit: 'кг'}],
      });
    }
  });

  test('Fuzzy check combinations', () => {
    const quantity = 5;
    const quantity_units = ['шт'];
    const weight = 100;
    const weight_units = {
      'кг': ['г', 'грамм', 'гр'],
      'л': ['мл'],
    };
    const delimiter = ['по', '×', 'х', '*'];
    for (const q_u of quantity_units) {
      for (const [unit, unit_displays] of Object.entries(weight_units)) {
        for (const u_d of unit_displays) {
          for (const d of delimiter) {

            const weight_variations = [`${weight}${u_d}`, `${weight} ${u_d}`, `${weight} ${u_d}.`];
            const quantity_variations = [`${quantity}${q_u}`, `${quantity} ${q_u}`,
              `${quantity} ${q_u}.`, `${quantity}`];
            let delim_variations = [d, ` ${d}`, `${d} `, ` ${d} `, `    ${d}    `];
            if (['по'].includes(d))  {
              // Word delim must be around spaces
              delim_variations = [` ${d} `]
            }

            for (const w of weight_variations) {
              for (const q of quantity_variations) {
                for (const dv of delim_variations) {
                  const titles = [`${w}${dv}${q}`, `${q}${dv}${w}`];
                  for (const t of titles) {
                    expect(parseTitle('Рис, ' + t), t).toStrictEqual({
                      quantity: quantity,
                      units: [{total: (weight * quantity) / 1000, value: weight / 1000, unit: unit}],
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});
test('Priority parse weight with quantity', () => {
  expect(parseTitle('Кофе молотый 500 г, Peppo\'s набор 2 упаковки по 250 гр')).toStrictEqual({
    quantity: 2,
    units: [{
      total: .25 * 2,
      value: .25,
      unit: 'кг',
    }],
  });
  expect(parseTitle('Кофе молотый, 1 кг, натуральный (2 упаковки по 500г)')).toStrictEqual({
    quantity: 2,
    units: [{
      total: .5 * 2,
      value: .5,
      unit: 'кг',
    }],
  });
  expect(parseTitle('Порционный сахар в стиках 1 кг (200шт. х 5 гр.) белый')).toStrictEqual({
    quantity: 200,
    units: [{
      total: .005 * 200,
      value: .005,
      unit: 'кг',
    }],
  });
});
test('Extract combined quantity', () => {
  expect(parseTitle('60шт х 10уп')).toStrictEqual({
    quantity: 600,
    units: [],
  });
  expect(parseTitle('SYNERGETIC 110 шт, набор 2х55 шт, бесфосфатные')).toStrictEqual({
    quantity: 110,
    units: [],
  });
});


describe('Parse with price', () => {
  test('with quantity', () => {
    expect(parseTitleWithPrice('Aroy-d 70% жирность 17-19%, 2 шт', 200))
      .toStrictEqual({
        quantity: 2,
        quantity_price: 100,
        quantity_price_display: '100 ₽/шт',
        units: [],
      });
  });
  test('with unit', () => {
    expect(parseTitleWithPrice('Aroy-d 70% жирность 17-19%, 200г', 200))
      .toStrictEqual({
        quantity: 1,
        quantity_price: null,
        quantity_price_display: null,
        units: [{
          total: .2,
          value: .2,
          price: 200 / .2,
          price_display: '1000 ₽/кг',
          unit: 'кг',
        }],
      });
  });
  test('without unit', () => {
    expect(parseTitleWithPrice('Aroy-d 70% 17-19%', 200))
      .toStrictEqual(null);
  });

  test('With quantity and unit', () => {
    expect(parseTitleWithPrice('Aroy-d 70% 17-19% 500 мл x 2 шт', 200))
      .toStrictEqual({
        'quantity': 2,
        'quantity_price': 100,
        'quantity_price_display': '100 ₽/шт',
        'units': [
          {
            'price': 200,
            'price_display': '200 ₽/л',
            'total': 1,
            'unit': 'л',
            'value': 0.5,
          },
        ],
      });
  });
});


describe('Multi-units', () => {
  test('Parse led lamps, we need compare lm/w and lm/rub', () => {
    expect(parseTitle('Лампа светодиодная E27 220-240 В 10 Вт ' +
      'груша матовая 1000 лм нейтральный белый свет')).toStrictEqual(
      {
        quantity: 1,
        units: [
          {
            value: 1000,
            unit: 'лм',
            total: 1000,
          },
          {
            value: 10,
            unit: 'Вт',
            total: 10,
          },
        ],
      },
    );
  });
});
