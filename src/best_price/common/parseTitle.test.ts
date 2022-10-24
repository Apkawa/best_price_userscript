import {parseTitle} from './parseTitle';

describe('weight', () => {
  test('Extract weight', () => {
    expect(parseTitle('Garnier, 1,5кг')).toStrictEqual({
      weight: 1.5,
      quantity: 1,
      item_weight: 1.5,
      weight_unit: 'кг',
    });

    expect(parseTitle('Сметана Пискаревская, 15%, 200 г')).toStrictEqual({
      weight: 0.2,
      quantity: 1,
      item_weight: 0.2,
      weight_unit: 'кг',
    });
    expect(
      parseTitle('Творог фруктовый Агуша Черника 3.9% 100г для дет.пит. с 6 месяцев'),
    ).toStrictEqual({
      weight: 0.1,
      quantity: 1,
      item_weight: 0.1,
      weight_unit: 'кг',
    });

    expect(parseTitle('Garnier Банан для очень сухих волос, 390 мл')).toStrictEqual({
      weight: 0.39,
      quantity: 1,
      item_weight: 0.39,
      weight_unit: 'л',
    });
    expect(parseTitle('Garnier, 390 грамм')).toStrictEqual({
      weight: 0.39,
      quantity: 1,
      item_weight: 0.39,
      weight_unit: 'кг',
    });
  });
  test('extract length', () => {
    expect(parseTitle('Силовой кабель МБ Провод ВВГмб-П нг(А)-LS 3 x 1,5 мм², 10 м')).toStrictEqual(
      {
        weight: 10,
        quantity: 1,
        item_weight: 10,
        weight_unit: 'м',
      },
    );
  });
});
test('Extract quantity', () => {
  expect(parseTitle('Aroy-d Кокосовое молоко 70% жирность 17-19%, 2 шт')).toStrictEqual({
    weight: null,
    quantity: 2,
    item_weight: null,
    weight_unit: null,
  });
});

test('Extract quantity and weight', () => {
  expect(parseTitle('Рис Увелка пропаренный, 5×80 г')).toStrictEqual({
    weight: 0.08 * 5,
    quantity: 5,
    item_weight: 0.08,
    weight_unit: 'кг',
  });
  expect(parseTitle("Кофе молотый 500 г, Peppo's набор 2 упаковки по 250 гр")).toStrictEqual({
    weight: 0.5,
    quantity: 2,
    item_weight: 0.25,
    weight_unit: 'кг',
  });
  expect(parseTitle('Кофе молотый, 1 кг, натуральный (2 упаковки по 500г)')).toStrictEqual({
    weight: 1,
    quantity: 2,
    item_weight: 0.5,
    weight_unit: 'кг',
  });

  expect(
    parseTitle('Пряность Куркума молотая для мяса, риса, овощей Global Spice - набор 3х20 г'),
  ).toStrictEqual({
    weight: 0.02 * 3,
    quantity: 3,
    item_weight: 0.02,
    weight_unit: 'кг',
  });

  expect(parseTitle('Aroy-d Кокосовое молоко 70% жирность 17-19%, 500 мл x 2 шт')).toStrictEqual({
    weight: 1.0,
    quantity: 2,
    item_weight: 0.5,
    weight_unit: 'л',
  });

  expect(parseTitle('100% Кокосовое молоко АЗБУКА ПРОДУКТОВ кулинарное 6шт*1л')).toStrictEqual({
    weight: 6.0,
    quantity: 6,
    item_weight: 1.0,
    weight_unit: 'л',
  });

  expect(
    parseTitle('Тофу классический, соевый продукт, комплект 2 шт. по 300 грамм, Green East'),
  ).toStrictEqual({
    weight: 0.6,
    quantity: 2,
    item_weight: 0.3,
    weight_unit: 'кг',
  });

  expect(parseTitle('Влажный корм для кошек Whiskas, 75 г x 28')).toStrictEqual({
    weight: 0.075 * 28,
    quantity: 28,
    item_weight: 0.075,
    weight_unit: 'кг',
  });
});

test('Extract quantity and weight with priority', () => {
  expect(parseTitle('Порционный сахар в стиках 1 кг (200шт. х 5 гр.) белый')).toStrictEqual({
    weight: 0.005 * 200,
    quantity: 200,
    item_weight: 0.005,
    weight_unit: 'кг',
  });
});

test('Extract combined quantity', () => {
  expect(parseTitle('60шт х 10уп')).toStrictEqual({
    weight: null,
    quantity: 600,
    item_weight: null,
    weight_unit: null,
  });
  expect(parseTitle('SYNERGETIC 110 шт, набор 2х55 шт, бесфосфатные')).toStrictEqual({
    weight: null,
    quantity: 110,
    item_weight: null,
    weight_unit: null,
  });
});
