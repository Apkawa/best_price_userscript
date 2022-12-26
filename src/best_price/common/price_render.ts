import {ParseTitlePriceResult} from './parseTitle';
import {BEST_PRICE_CLASS_NAME} from './constants';

export function renderBestPrice(titleInfo: ParseTitlePriceResult | null): HTMLElement {
  const wrapEl = document.createElement('div');
  wrapEl.className = BEST_PRICE_CLASS_NAME;
  if (!titleInfo) {
    return wrapEl;
  }
  for (const u of titleInfo.units) {
    const el = document.createElement('p');
    el.innerText = u.price_display;
    wrapEl.appendChild(el);
  }
  if (titleInfo.quantity_price_display) {
    const qtyEl = document.createElement('p');
    qtyEl.innerText = titleInfo.quantity_price_display;
    wrapEl.appendChild(qtyEl);
  }
  if (wrapEl.childNodes.length) {
    wrapEl.style.border = '1px solid red';
    wrapEl.style.padding = '5px';
    wrapEl.style.margin = '5px';
    wrapEl.style.width = 'fit-content';
  }
  return wrapEl;
}
