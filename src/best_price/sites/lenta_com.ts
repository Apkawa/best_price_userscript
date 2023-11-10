import {matchLocation, waitCompletePage} from '../../utils';
import {getPrice, getPriceFromElement} from '../common/price_parse';
import {parseTitleWithPrice} from '../common/parseTitle';
import {renderBestPrice} from '../common/price_render';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {copyElementToNewRoot, ElementGetOrCreate} from '../../utils/dom';
import {BEST_PRICE_WRAP_CLASS_NAME} from '../common/constants';
import {storeParsedTitleToElement} from '../common/store';

export function initProductPage(): void {
  const init = () => {
    const title = document.querySelector('.sku-page__title')?.textContent?.trim();
    let price = getPrice('.sku-price--primary');
    if (!price || !title) return;
    price /= 100; // В ленте цена всегда с копейками
    console.log(title, price);
    const parsedTitle = parseTitleWithPrice(title, price);
    document.querySelector('.sku-prices-block')?.after(renderBestPrice(parsedTitle));
  };
  waitCompletePage(() => {
    init();
  });
}

function processProductCard(cardEl: HTMLElement) {
  if (cardEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME)) return;
  let price = getPriceFromElement(
    cardEl.querySelector<HTMLElement>('.lui-priceText--view_secondary'),
  );
  const title = cardEl
    .querySelector('.lui-sku-product-card-text--view-primary')
    ?.textContent?.trim();
  if (!title || !price) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  price /= 100;
  console.log(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  cardEl.querySelector('.lui-sku-product-card-price')?.after(renderBestPrice(parsedTitle));
  storeParsedTitleToElement(cardEl, parsedTitle);
}

export function initCatalog(): void {
  const init = () => {
    const cardList = document.querySelectorAll<HTMLElement>('.lui-sku-product-card');
    for (const cardEl of cardList) {
      processProductCard(cardEl);
    }
    const catalogWrapEl = document.querySelector<HTMLElement>('.catalog-grid__grid');

    const buttonWrapEl = ElementGetOrCreate(
      document.querySelector<HTMLElement>('.catalog-sorting'),
      {
        pos: 'before',
      },
    );
    if (catalogWrapEl && buttonWrapEl) {
      initReorderCatalog(catalogWrapEl, buttonWrapEl);
    }
    const catalogEl = document.querySelector<HTMLElement>('.catalog-view__main');
    const paginationRootWrap = ElementGetOrCreate(catalogEl, {
      pos: 'before',
      className: 'GM-pagination-clone',
    });
    paginationRootWrap &&
      copyElementToNewRoot(catalogEl?.querySelectorAll('.pagination'), paginationRootWrap);
    waitCompletePage(
      () => {
        init();
      },
      {
        root: document.querySelector<HTMLElement>('.catalog-view__grid-container'),
      },
    );
  };

  waitCompletePage(() => {
    init();
  });
}

(function () {
  'use strict';
  if (!matchLocation('^https://lenta\\.com/.*')) {
    return;
  }

  console.log('Lenta.com');

  if (matchLocation('^https://lenta\\.com/product/.*')) {
    initProductPage();
  }

  if (matchLocation('^https://lenta\\.com/(catalog|search|brand)/.*')) {
    initCatalog();
  }
})();
