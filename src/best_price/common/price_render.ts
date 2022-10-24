import {ParseTitlePriceResult} from './parseTitle';

export function renderBestPrice(titleInfo: ParseTitlePriceResult | null): HTMLElement {
  const wrapEl = document.createElement('div');
  wrapEl.className = 'GM-best-price';
  if (!titleInfo) {
    return wrapEl;
  }
  if (titleInfo.weight_price_display) {
    const weightEl = document.createElement('p');
    // price -> weight
    //  x    -> 1000г
    // TODO unit size
    weightEl.innerText = titleInfo.weight_price_display;
    wrapEl.appendChild(weightEl);
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
