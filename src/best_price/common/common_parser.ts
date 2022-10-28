import {storeParsedTitleToElement} from '.';
import {InsertPosition} from '../../utils/dom';
import {BEST_PRICE_CLASS_NAME, BEST_PRICE_WRAP_CLASS_NAME} from './constants';
import {parseTitleWithPrice} from './parseTitle';
import {getPrice} from './price_parse';
import {renderBestPrice} from './price_render';

export interface ProcessProductCardOptions {
  price_sel: string;
  title_sel: string;
  to_render:
    | string
    | {
        sel: string;
        pos?: InsertPosition;
      };
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

  const renderedPrice = renderBestPrice(parsedTitle);
  let to_render_sel = '';
  let to_render_pos: InsertPosition = 'after';
  if (typeof to_render === 'string') {
    to_render_sel = to_render;
  } else {
    to_render_sel = to_render.sel;
    to_render_pos = to_render.pos || to_render_pos;
  }
  const to_render_el = cardEl.querySelector(to_render_sel);
  to_render_el?.parentElement
    ?.querySelectorAll('.' + BEST_PRICE_CLASS_NAME)
    .forEach((e) => e.remove());
  to_render_el?.[to_render_pos](renderedPrice);
  storeParsedTitleToElement(cardEl, parsedTitle);
}
