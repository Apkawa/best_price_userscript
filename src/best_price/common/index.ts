import {ParseTitlePriceResult} from './parseTitle';
import {entries} from '../../utils';
import {BEST_PRICE_WRAP_CLASS_NAME} from './constants';

export function storeParsedTitleToElement(
  cardEl: HTMLElement,
  parsedTitle: ParseTitlePriceResult | null,
): void {
  cardEl.classList.add(BEST_PRICE_WRAP_CLASS_NAME);
  if (!parsedTitle) return;
  const ds = cardEl.dataset;
  for (const [k, v] of entries(parsedTitle)) {
    ds[k] = (v || '').toString();
  }
}
