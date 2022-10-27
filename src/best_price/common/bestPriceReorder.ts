import {E, entries, GM_addStyle, values} from '../../utils';
import {sort} from '../../utils/sort';
import {BEST_PRICE_WRAP_CLASS_NAME, MAX_NUMBER, ORDER_NAME_LOCAL_STORAGE} from './constants';

const BEST_ORDER_BUTTON_CLASS_NAME = 'GM-best-price-button-wrap';

GM_addStyle(`button.${BEST_ORDER_BUTTON_CLASS_NAME}.active { border: 2px solid red; }`);

interface CatalogRecord {
  initial_order: number;
  weight_price: number | null;
  quantity_price: number | null;
  el: HTMLElement;
}

type OrderState = keyof Omit<CatalogRecord, 'el'>;

export function initReorderCatalog(catalogRoot: HTMLElement, buttonRoot: HTMLElement): void {
  const buttonWrap = buttonRoot;
  if (!buttonWrap) return;

  const catalogRecords: CatalogRecord[] = [];
  let i = 0;
  for (const wrapEl of catalogRoot.querySelectorAll<HTMLElement>(':scope > *')) {
    const el = wrapEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME)
      ? wrapEl
      : wrapEl.querySelector<HTMLElement>('.' + BEST_PRICE_WRAP_CLASS_NAME);
    if (!el) {
      console.warn('!', el);
      continue;
    }
    const ds = el.dataset;
    i += 1;
    catalogRecords.push({
      el: wrapEl,
      initial_order: i,
      weight_price: ds.weight_price ? parseFloat(ds.weight_price) : MAX_NUMBER,
      quantity_price: ds.quantity_price ? parseFloat(ds.quantity_price) : MAX_NUMBER,
    });
  }

  const buttons = {
    initial_order: E('button', {class: BEST_ORDER_BUTTON_CLASS_NAME}, 'Reset'),
    weight_price: E('button', {class: BEST_ORDER_BUTTON_CLASS_NAME}, 'by Weight'),
    quantity_price: E('button', {class: BEST_ORDER_BUTTON_CLASS_NAME}, 'by Quantity'),
  };

  function buttonClickHandler(orderState: OrderState) {
    console.log(orderState);
    localStorage.setItem(ORDER_NAME_LOCAL_STORAGE, orderState);
    sort<CatalogRecord>(catalogRecords, orderState);
    refreshCatalog();
    setActiveButton(buttons[orderState]);
  }

  for (const [k, b] of entries(buttons)) {
    b.onclick = () => {
      buttonClickHandler(k);
    };
  }

  const defaultOrder = localStorage.getItem(ORDER_NAME_LOCAL_STORAGE) as OrderState | null;

  if (defaultOrder) {
    if (defaultOrder === 'initial_order') {
      setActiveButton(buttons[defaultOrder]);
    } else {
      buttonClickHandler(defaultOrder);
    }
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

  buttonWrap.querySelector('.' + BEST_ORDER_BUTTON_CLASS_NAME)?.remove();
  buttonWrap.appendChild(E('div', {class: BEST_ORDER_BUTTON_CLASS_NAME}, ...values(buttons)));
}
