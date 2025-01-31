import {ParseTitlePriceResult} from './parseTitle';
import {BEST_PRICE_WRAP_CLASS_NAME} from './constants';
import {entries} from '../../utils';

const PREFIX = 'bp_';

export function storeParsedTitleToElement(
  cardEl: HTMLElement,
  parsedTitle: ParseTitlePriceResult | null,
): void {
  cardEl.classList.add(BEST_PRICE_WRAP_CLASS_NAME);
  if (!parsedTitle) return;
  storeDataToElement(cardEl, parsedTitle);
}

type DataInfoType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export function storeDataToElement(el: HTMLElement, data: DataInfoType) {
  const ds = el.dataset;
  for (const [k, v] of entries(data)) {
    ds[PREFIX + k] = JSON.stringify(v);
  }
}

export function readDataFromElement(el: HTMLElement): DataInfoType {
  const pairs = Object.entries(el.dataset)
    .map(([k, v]) => {
      if (k.startsWith(PREFIX)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return [k.replace(RegExp('^' + PREFIX), ''), JSON.parse(v || '')];
      }
      return [null, null];
    })
    .filter(([k]) => k);
  if (pairs.length > 0) {
    return Object.fromEntries(pairs) as ParseTitlePriceResult;
  }
  return {};
}

export function loadParsedTitleFromElement(cardEl: HTMLElement): ParseTitlePriceResult | null {
  const pairs = Object.entries(cardEl.dataset)
    .map(([k, v]) => {
      if (k.startsWith(PREFIX)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return [k.replace(RegExp('^' + PREFIX), ''), JSON.parse(v || '')];
      }
      return [null, null];
    })
    .filter(([k]) => k);
  if (pairs.length > 0) {
    return Object.fromEntries(pairs) as ParseTitlePriceResult;
  }
  return null;
}
