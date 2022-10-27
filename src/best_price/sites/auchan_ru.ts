import {getElementByXpath, matchLocation, waitCompletePage} from '../../utils';
import {getPrice, getPriceFromElement} from '../common/price_parse';
import {parseTitleWithPrice} from '../common/parseTitle';
import {renderBestPrice} from '../common/price_render';
import {storeParsedTitleToElement} from '../common';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {copyElementToNewRoot, ElementGetOrCreate} from '../../utils/dom';

export function initProductPage(): void {
  const init = () => {
    if (document.querySelector('main .GM-best-price')) return;
    const title = document.querySelector('main h1#productName')?.textContent?.trim();
    const price = getPrice('main .fullPricePDP');
    if (!price || !title) return;
    console.log(title, price);
    const parsedTitle = parseTitleWithPrice(title, price);
    document.querySelector('main .fullPricePDP')?.after(renderBestPrice(parsedTitle));
  };
  init();
}

function processProductCard(
  cardEl: HTMLElement,
  priceSel: string,
  titleSel: string,
  renderPriceSel: string,
): void {
  if (cardEl.classList.contains('GM-best-price-wrap')) return;
  const price = getPriceFromElement(cardEl.querySelector<HTMLElement>(priceSel));
  const title = cardEl.querySelector(titleSel)?.textContent?.trim();
  if (!title || !price) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  console.log(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  cardEl.querySelector(renderPriceSel)?.after(renderBestPrice(parsedTitle));
  storeParsedTitleToElement(cardEl, parsedTitle);
}

export function initCatalog(): void {
  const init = () => {
    const cardList = document.querySelectorAll<HTMLElement>('article.productCard');
    for (const cardEl of cardList) {
      processProductCard(
        cardEl,
        '.productCardPriceData > div',
        '.linkToPDP',
        '.productCardPriceData ',
      );
    }
    // Reorder
    const catalogWrapEl = getElementByXpath(
      '//article[contains(@class,"productCard")]/ancestor::main//article/../..',
    );
    if (!document.querySelector('.GM-wrap')) {
      const buttonWrapEl = ElementGetOrCreate(
        document.querySelector<HTMLElement>('#categoriesThirdLvlList'),
        {
          pos: 'after',
        },
      );
      if (catalogWrapEl && buttonWrapEl) {
        initReorderCatalog(catalogWrapEl, buttonWrapEl);
      }
    }

    // Copy pagination on top
    const catalogEl = document.querySelector<HTMLElement>('.catalog-view__main');
    const paginationRootWrap = ElementGetOrCreate(catalogEl, {
      pos: 'before',
      className: 'GM-pagination-clone',
    });
    paginationRootWrap &&
      copyElementToNewRoot(catalogEl?.querySelectorAll('.pagination'), paginationRootWrap);
  };
  init();
}

export function initSearchResults(): void {
  const cardList = document.querySelectorAll<HTMLElement>('.digi-product');
  for (const cardEl of cardList) {
    processProductCard(
      cardEl,
      '.digi-product-price-variant_actual',
      '.digi-product__label',
      '.price-and-cart',
    );
  }
  // Reorder
  const catalogWrapEl = document.querySelector<HTMLElement>('.digi-products-grid');
  if (!document.querySelector('.digi-search .GM-wrap')) {
    const buttonWrapEl = ElementGetOrCreate(
      document.querySelector<HTMLElement>('.digi-main-results-actions'),
      {
        pos: 'after',
      },
    );
    if (catalogWrapEl && buttonWrapEl) {
      initReorderCatalog(catalogWrapEl, buttonWrapEl);
    }
  }
}

(function () {
  'use strict';
  if (!matchLocation('^https://(www\\.|)auchan\\.ru/.*')) {
    return;
  }

  waitCompletePage(
    () => {
      if (document.querySelector('#productName')) {
        initProductPage();
      } else {
        if (document.querySelector('.digi-products')) {
          initSearchResults();
        } else {
          initCatalog();
        }
      }
    },
    {
      runOnce: false,
    },
  );
})();
