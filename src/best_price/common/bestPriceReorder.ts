import {E, entries, GM_addStyle, values} from '../../utils';
import {sort} from '../../utils/sort';
import {BEST_PRICE_WRAP_CLASS_NAME, MAX_NUMBER, ORDER_NAME_LOCAL_STORAGE} from './constants';

GM_addStyle('button.GM-best-order-button.active { border: 2px solid red; }');

interface CatalogRecord {
  initial_order: number;
  weight_price: number | null;
  quantity_price: number | null;
  el: HTMLElement;
}

export function initReorderCatalog(catalogRoot: HTMLElement, buttonRoot: HTMLElement): void {
  const buttonWrap = buttonRoot;
  if (!buttonWrap) return;

  const catalogRecords: CatalogRecord[] = [];
  let i = 0;
  for (const wrapEl of catalogRoot.querySelectorAll(':scope > *')) {
    const el = wrapEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME)
      ? wrapEl
      : wrapEl.querySelector('.' + BEST_PRICE_WRAP_CLASS_NAME);
    const ds = (el as HTMLElement).dataset;
    i += 1;
    catalogRecords.push({
      el: wrapEl as HTMLElement,
      initial_order: i,
      weight_price: ds.weight_price ? parseFloat(ds.weight_price) : MAX_NUMBER,
      quantity_price: ds.quantity_price ? parseFloat(ds.quantity_price) : MAX_NUMBER,
    });
  }

  const buttons = {
    initial_order: E('button', {class: 'GM-best-order-button'}, 'Reset'),
    weight_price: E('button', {class: 'GM-best-order-button'}, 'by Weight'),
    quantity_price: E('button', {class: 'GM-best-order-button'}, 'by Quantity'),
  };

  for (const [k, b] of entries(buttons)) {
    b.onclick = () => {
      console.log(k);
      localStorage.setItem(ORDER_NAME_LOCAL_STORAGE, k);
      sort<CatalogRecord>(catalogRecords, k);
      refreshCatalog();
      setActiveButton(b);
    };
  }

  const defaultOrder = localStorage.getItem(ORDER_NAME_LOCAL_STORAGE) as
    | keyof Omit<CatalogRecord, 'el'>
    | null;

  if (defaultOrder) {
    buttons[defaultOrder].click();
  }

  function refreshCatalog(): void {
    const wrap = catalogRoot;
    if (!wrap) return;
    const elements = document.createDocumentFragment();
    for (const c of catalogRecords) {
      elements.appendChild(c.el);
    }
    wrap.innerHTML = '';
    wrap.appendChild(elements);
  }

  function setActiveButton(button: HTMLElement) {
    for (const b of values(buttons)) {
      b.classList.remove('active');
    }
    button.classList.add('active');
  }

  buttonWrap.querySelector('.GM-best-price-button-wrap')?.remove();
  buttonWrap.appendChild(E('div', {class: 'GM-best-price-button-wrap'}, ...values(buttons)));
}
