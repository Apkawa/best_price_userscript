import {InsertPosition} from '../../utils/dom';
import {BEST_PRICE_CLASS_NAME, BEST_PRICE_WRAP_CLASS_NAME} from './constants';
import {parseTitleWithPrice} from './parseTitle';
import {getPrice} from './price_parse';
import {renderBestPrice, RenderBestPriceExtraStyle} from './price_render';
import {storeParsedTitleToElement} from './store';

export interface ProcessProductCardOptions {
  price_sel: string;
  title_sel: string;
  to_render:
    | string
    | {
        sel: string;
        pos?: InsertPosition;
      };
  extra_style?: RenderBestPriceExtraStyle | null;
}

export function processProductCard(cardEl: HTMLElement, options: ProcessProductCardOptions): void {
  const {price_sel, title_sel, to_render} = options;
  if (cardEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME)) return;

  const price = getPrice(price_sel, cardEl);
  const title = cardEl.querySelector(title_sel)?.textContent?.trim();
  if (!title || !price) {
    console.warn('Not found price or title', title, price, cardEl);
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  console.debug(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);

  const renderedPrice = renderBestPrice(parsedTitle, options.extra_style);
  let to_render_sel = '';
  let to_render_pos: InsertPosition = 'after';
  if (typeof to_render === 'string') {
    to_render_sel = to_render;
  } else {
    to_render_sel = to_render.sel;
    to_render_pos = to_render.pos || to_render_pos;
  }
  const to_render_els = cardEl.querySelectorAll(to_render_sel);
  // Cleanup
  for (const to_render_el of to_render_els) {
    for (const e of to_render_el?.parentElement?.querySelectorAll('.' + BEST_PRICE_CLASS_NAME) ||
      []) {
      e.remove();
    }
  }
  let i = 0;
  for (const to_render_el of to_render_els) {
    let r = renderedPrice;
    if (i > 0) {
      r = renderedPrice.cloneNode(true) as HTMLElement;
    }
    to_render_el?.[to_render_pos](r);
    i += 1;
  }
  storeParsedTitleToElement(cardEl, parsedTitle);
}
