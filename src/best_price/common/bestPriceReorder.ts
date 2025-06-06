import {E, GM_addStyle, entries, values} from '../../utils';
import {sort} from '../../utils/sort';
import {BEST_PRICE_WRAP_CLASS_NAME, MAX_NUMBER, ORDER_NAME_LOCAL_STORAGE} from './constants';
import {loadParsedTitleFromElement, storeDataToElement} from './store';

const BEST_ORDER_BUTTON_CLASS_NAME = 'GM-best-price-button-wrap';

function addStyles() {
  GM_addStyle(`button.${BEST_ORDER_BUTTON_CLASS_NAME} {
border: 1px solid gray !important; padding: 5px !important; margin: 3px !important; }
`);
  GM_addStyle(
    `button.${BEST_ORDER_BUTTON_CLASS_NAME}.active { border: 2px solid red !important; }`,
  );
}

addStyles();

interface CatalogRecord extends Record<string, unknown> {
  initial_order: number;
  weight_price: number | null;
  quantity_price: number | null;
  el: HTMLElement;
}

type OrderState = keyof Pick<CatalogRecord, 'initial_order' | 'weight_price' | 'quantity_price'>;

// TODO button style
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
    const ds = {
      initial_order: '0',
      ...loadParsedTitleFromElement(el),
    };
    if (!ds) {
      continue;
    }
    i += 1;
    let initial_order = parseInt(ds.initial_order || '0');
    if (!initial_order) {
      initial_order = i;
      ds.initial_order = i.toString();
      storeDataToElement(el, {initial_order: i});
    }
    const record: CatalogRecord = {
      el: wrapEl,
      initial_order,
      weight_price: ds.units?.[0]?.price ? ds.units[0].price : MAX_NUMBER,
      quantity_price: ds.quantity_price ? ds.quantity_price : MAX_NUMBER,
    };
    catalogRecords.push(record);
    console.debug('Catalog order record: ', record);
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
