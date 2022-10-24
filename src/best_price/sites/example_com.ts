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
    const price = getPrice('.sku-price--primary');
    if (!price || !title) return;
    console.log(title, price);
    const parsedTitle = parseTitleWithPrice(title, price);
    document.querySelector('.sku-prices-block')?.after(renderBestPrice(parsedTitle));
  };
  waitCompletePage(() => {
    init();
  });
}

function processProductCard(cardEl: HTMLElement): void {
  if (cardEl.classList.contains('GM-best-price-wrap')) return;

  const price = getPriceFromElement(cardEl.querySelector('.price-label--primary'));
  const title = cardEl.querySelector('.sku-card-small-header__title')?.textContent?.trim();

  if (!title || !price) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  console.log(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  cardEl.querySelector('.sku-card-small-prices ')?.after(renderBestPrice(parsedTitle));
  storeParsedTitleToElement(cardEl, parsedTitle);
}

export function initCatalog(): void {
  const init = () => {
    const cardList = document.querySelectorAll('.sku-card-small');
    for (const cardEl of cardList) {
      processProductCard(cardEl as HTMLElement);
    }
    // Reorder
    const catalogWrapEl = document.querySelector('.catalog-grid__grid');
    const buttonWrapEl = ElementGetOrCreate(document.querySelector('.catalog-sorting'), {
      pos: 'before',
    });
    if (catalogWrapEl && buttonWrapEl) {
      initReorderCatalog(catalogWrapEl as HTMLElement, buttonWrapEl);
    }

    // Copy pagination on top
    const catalogEl = document.querySelector<HTMLElement>('.catalog-view__main');
    const paginationRootWrap = ElementGetOrCreate(catalogEl, {
      pos: 'before',
      className: 'GM-pagination-clone',
    });
    paginationRootWrap &&
      copyElementToNewRoot(catalogEl?.querySelectorAll('.pagination'), paginationRootWrap);

    // Handle dynamic update
    const catalogContainerEl = document.querySelector<HTMLElement>('.catalog-view__grid-container');
    catalogContainerEl &&
      waitCompletePage(() => {
        init();
      }, catalogContainerEl);
  };

  waitCompletePage(() => {
    init();
  });
}

(function () {
  'use strict';
  if (!matchLocation('^https://example\\.com/.*')) {
    return;
  }

  if (matchLocation('^https://example\\.com/product/.*')) {
    initProductPage();
  }

  if (matchLocation('^https://example\\.com/(catalog|search|brand)/.*')) {
    initCatalog();
  }
})();
