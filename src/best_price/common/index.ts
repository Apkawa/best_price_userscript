import {ParseTitlePriceResult} from './parseTitle';
import {entries} from '../../utils';

export function storeParsedTitleToElement(
  cardEl: HTMLElement,
  parsedTitle: ParseTitlePriceResult | null,
): void {
  cardEl.classList.add('GM-best-price-wrap');
  if (!parsedTitle) return;
  const ds = cardEl.dataset;
  for (const [k, v] of entries(parsedTitle)) {
    ds[k] = (v || '').toString();
  }
}
