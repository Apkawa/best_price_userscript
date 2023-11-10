import {ParseTitlePriceResult} from './parseTitle';
import {BEST_PRICE_CLASS_NAME} from './constants';
import {entries} from '../../utils';

export type RenderBestPriceExtraStyle = Omit<
  Partial<CSSStyleDeclaration>,
  | 'length'
  | 'parentRule'
  | 'getPropertyPriority'
  | 'getPropertyValue'
  | 'item'
  | 'removeProperty'
  | 'setProperty'
>;

export function renderBestPrice(
  titleInfo: ParseTitlePriceResult | null,
  extraStyle: RenderBestPriceExtraStyle | null = {},
): HTMLElement {
  const wrapEl = document.createElement('div');
  wrapEl.className = BEST_PRICE_CLASS_NAME;
  if (!titleInfo) {
    return wrapEl;
  }
  // нужно отказаться от innerText https://github.com/jsdom/jsdom/issues/1245
  for (const u of titleInfo.units) {
    const el = document.createElement('p');
    el.innerHTML = u.price_display;
    wrapEl.appendChild(el);
  }
  if (titleInfo.quantity_price_display) {
    const qtyEl = document.createElement('p');
    qtyEl.innerHTML = titleInfo.quantity_price_display;
    wrapEl.appendChild(qtyEl);
  }
  if (wrapEl.childNodes.length) {
    wrapEl.style.border = '1px solid red';
    wrapEl.style.padding = '5px';
    wrapEl.style.margin = '5px';
    wrapEl.style.width = 'fit-content';
    for (const [k, v] of entries(extraStyle || {})) {
      if (typeof v == 'string') {
        wrapEl.style[k] = v;
      }
    }
  }
  return wrapEl;
}
