import {mRegExp, round} from '../../utils';

export type Unit = 'кг' | 'л' | 'м';

export interface UnitValue {
  unit: Unit;
  value: number; // Per item value
  total: number; // Per quantity summary,
}

export interface ParseTitleResult {
  quantity: number;
  units: UnitValue[];
}

// const WORD_BOUNDARY_BEGIN = /(?:^|\s)/
const WORD_BOUNDARY_END = /(?=\s+|[.,);/]|[хx]|[^\u0400-\u04ff]|$)/;
const WEIGHT_REGEXP = mRegExp([
  /(?<value>\d+[,.]\d+|\d+)/, // Value
  /\s?/, // Space
  '(?<unit>',
  '(?<weight_unit>(?<weight_SI>кг|килограмм(?:ов|а|))|г|грамм(?:ов|а|)|гр)',
  '|(?<volume_unit>(?<volume_SI>л|литр(?:ов|а|))|мл)',
  '|(?<length_unit>(?<length_SI>м|метр(?:ов|а|)))',
  ')\\.?',
  WORD_BOUNDARY_END,
]);

function plural(name: string, plurals: string[] = ['ок', 'ки', 'ка']): string {
  return `${name}(?:${plurals.join('|')})`;
}

const QUANTITY_UNITS = [
  'шт',
  'рулон',
  'пакет',
  'уп',
  plural('упаков'),
  plural('салфет'),
  'таб',
  'капсул',
  plural('флакон', ['', 'a', 'ов']),
  plural('пар', ['', 'a', 'ы']),
];

const QUANTITY_REGEXP = RegExp(
  `(?<quantity>\\d+)\\s?(?<quantity_unit>${QUANTITY_UNITS.join('|')})\\.?`,
);

const QUANTITY_2_REGEXP = RegExp(
  `(?<quantity_2>\\d+)\\s?(?<quantity_2_unit>${QUANTITY_UNITS.join('|')})\\.?`,
);

const COMBINE_DELIMETER_REGEXP = /\s*?(?:[xх*×/]|по)\s*?/;
const COMBINE_QUANTITY_LIST = [
  mRegExp([/(?<quantity_2>\d+)/, COMBINE_DELIMETER_REGEXP, QUANTITY_REGEXP]), // 20x100шт
  mRegExp([QUANTITY_REGEXP, COMBINE_DELIMETER_REGEXP, /(?<quantity_2>\d+)/]), // 20уп*100
  mRegExp([QUANTITY_2_REGEXP, COMBINE_DELIMETER_REGEXP, QUANTITY_REGEXP]), // 20уп по 100салф
];
const COMBINE_QANTITY_WEIGHT_REGEXP_LIST = [
  mRegExp([WEIGHT_REGEXP, COMBINE_DELIMETER_REGEXP, QUANTITY_REGEXP]), // 100г.x20шт.
  mRegExp([QUANTITY_REGEXP, COMBINE_DELIMETER_REGEXP, WEIGHT_REGEXP]), // 20шт x 100г
  mRegExp([/(?<quantity>\d+)/, COMBINE_DELIMETER_REGEXP, WEIGHT_REGEXP]), // 20x100г
  mRegExp([WEIGHT_REGEXP, COMBINE_DELIMETER_REGEXP, /(?<quantity>\d+)/]), // 100гx20
];

interface MatchGroupsResult {
  quantity?: string;
  quantity_unit?: string;
  value?: string;
  unit?: string;
  weight_unit?: string;
  weight_SI?: string;
  volume_unit?: string;
  volume_SI?: string;
  length_unit?: string;
  length_SI?: string;
}

function parseGroups(groups: MatchGroupsResult, allowSum = true): ParseTitleResult {
  const result: ParseTitleResult = {
    quantity: 1,
    units: [],
  };

  if (groups.value) {
    const valueStr: string | undefined = groups?.value;
    const unit = groups?.unit;
    if (valueStr && unit) {
      let value = parseFloat(valueStr.replace(',', '.'));
      let unit: Unit | null = null;
      // Всегда считаем в мл и г
      if (groups.weight_unit) {
        if (!groups.weight_SI) {
          value /= 1000;
        }
        unit = 'кг';
      }
      if (groups.volume_unit) {
        if (!groups.volume_SI) {
          value /= 1000;
        }
        unit = 'л';
      }
      if (groups.length_unit) {
        if (!groups.length_SI) {
          value /= 1000;
        }
        unit = 'м';
      }
      if (!unit) {
        throw 'Unknown unit';
      }

      result.units.push({
        unit,
        value,
        total: value,
      });
    }
  }

  if (groups.quantity) {
    const valueStr: string | undefined = groups?.quantity;
    if (valueStr) {
      result.quantity = parseInt(valueStr);
    }
  }
  if (allowSum && result.quantity > 1) {
    for (const u of result.units) {
      u.total = result.quantity * u.value;
    }
  }
  return result;
}

export function parseTitle(title: string): ParseTitleResult {
  for (const r of COMBINE_QANTITY_WEIGHT_REGEXP_LIST) {
    const rMatch = r.exec(title);
    if (rMatch) {
      return parseGroups(rMatch.groups as MatchGroupsResult);
    }
  }

  let groups: {
    [key: string]: string;
  } = {};
  const weightMatch = WEIGHT_REGEXP.exec(title);
  if (weightMatch?.groups) {
    groups = weightMatch.groups;
  }

  let quantity = 0;
  for (const r of COMBINE_QUANTITY_LIST) {
    const rMatch = r.exec(title)?.groups;
    if (rMatch?.quantity && rMatch?.quantity_2) {
      quantity = parseInt(rMatch.quantity) * parseInt(rMatch.quantity_2);
      break;
    }
  }
  if (quantity) {
    groups.quantity = quantity.toString();
  } else {
    const quantityMatch = QUANTITY_REGEXP.exec(title);
    if (quantityMatch?.groups) {
      groups = {...groups, ...quantityMatch.groups};
    }
  }
  let allowSum = true;
  if (groups?.value) {
    // Кейс когда в товаре встречаются отдельно количества и единицы измерения.
    // По семантике в этом случае вес разделяется от количества.
    // Пример "Кофе молотый по восточному 1 кг 4 штуки" - это 4 пачки кофе суммарным весом 1кг.
    allowSum = false;
  }

  return parseGroups(groups as MatchGroupsResult, allowSum);
}

export interface UnitPriceValue extends UnitValue {
  price: number;
  price_display: string;
}

export interface ParseTitlePriceResult extends ParseTitleResult {
  units: UnitPriceValue[];
  quantity_price: number | null;
  quantity_price_display: string | null;
}

export function parseTitleWithPrice(title: string, price: number): ParseTitlePriceResult | null {
  const {units, ...titleParsed} = parseTitle(title);
  const res: ParseTitlePriceResult = {
    ...titleParsed,
    units: [],
    quantity_price: null,
    quantity_price_display: null,
  };

  if ((!res.quantity || res.quantity == 1) && !units.length) {
    return null;
  }
  for (const u of units) {
    const p = round(price / u.total);
    res.units.push({
      ...u,
      price: p,
      price_display: `${p} ₽/${u.unit || '?'}`,
    });
  }
  if (res.quantity > 1) {
    res.quantity_price = round(price / res.quantity);
    res.quantity_price_display = `${res.quantity_price} ₽/шт`;
  }
  return res;
}
