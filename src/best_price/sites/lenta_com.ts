import {matchLocation, waitCompletePage} from '../../utils';
import {getPrice, getPriceFromElement} from '../common/price_parse';
import {parseTitleWithPrice} from '../common/parseTitle';
import {renderBestPrice} from '../common/price_render';
import {storeParsedTitleToElement} from '../common';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {copyElementToNewRoot, ElementGetOrCreate} from '../../utils/dom';

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
  if (cardEl.classList.contains('GM-best-price-wrap')) return;
  let price = getPriceFromElement(cardEl.querySelector<HTMLElement>('.price-label--primary'));
  const title = cardEl.querySelector('.sku-card-small-header__title')?.textContent?.trim();
  if (!title || !price) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  price /= 100;
  console.log(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  cardEl.querySelector('.sku-card-small-prices ')?.after(renderBestPrice(parsedTitle));
  storeParsedTitleToElement(cardEl, parsedTitle);
}

export function initCatalog(): void {
  const init = () => {
    const cardList = document.querySelectorAll<HTMLElement>('.sku-card-small');
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

  if (matchLocation('^https://lenta\\.com/product/.*')) {
    initProductPage();
  }

  if (matchLocation('^https://lenta\\.com/(catalog|search|brand)/.*')) {
    initCatalog();
  }
})();
