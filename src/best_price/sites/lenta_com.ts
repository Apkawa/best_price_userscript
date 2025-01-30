import {GM_addStyle, matchLocation, waitCompletePage} from '../../utils';
import {getPriceFromElement} from '../common/price_parse';
import {parseTitleWithPrice} from '../common/parseTitle';
import {renderBestPrice} from '../common/price_render';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {copyElementToNewRoot, ElementGetOrCreate} from '../../utils/dom';
import {BEST_PRICE_WRAP_CLASS_NAME} from '../common/constants';
import {storeParsedTitleToElement} from '../common/store';
import {processProductCard} from '@/best_price/common/common_parser';

export function initProductPage(): void {
  const productRoot = document.querySelector<HTMLElement>('.product-page_info-block');
  if (!productRoot) return;

  processProductCard(productRoot, {
    price_sel: '.product-price .main-price',
    title_sel: 'lu-product-page-name h1',
    to_render: {
      sel: '.product-base-info_content',
      pos: 'after',
    },
    force: false,
  });
}

function processProductCardCatalog(cardEl: HTMLElement) {
  if (cardEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME)) return;
  const price = getPriceFromElement(
    cardEl.querySelector<HTMLElement>('.product-price .main-price'),
  );
  const title = cardEl.querySelector('.lu-product-card-name')?.textContent?.trim();
  if (!title || !price) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  console.log(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  cardEl?.appendChild(renderBestPrice(parsedTitle));
  storeParsedTitleToElement(cardEl, parsedTitle);
}

export function initCatalog(): void {
  const cardList = document.querySelectorAll<HTMLElement>(
    'lu-grid .lu-grid__item:has(:not(lu-placeholder))' +
      ',lu-slider .product-card:has(:not(lu-placeholder))', // Рекомендации
  );
  for (const cardEl of cardList) {
    processProductCardCatalog(cardEl);
  }

  const catalogWrapEl = document.querySelector<HTMLElement>('lu-catalog-list lu-grid > div');

  const buttonWrapEl = ElementGetOrCreate(
    document.querySelector<HTMLElement>('lu-catalog-list .catalog-list'),
    {
      pos: 'before',
    },
  );
  if (catalogWrapEl && buttonWrapEl) {
    initReorderCatalog(catalogWrapEl, buttonWrapEl);
  }

  const catalogEl = document.querySelector<HTMLElement>('lu-catalog-list .catalog-list');
  const paginationRootWrap = ElementGetOrCreate(catalogEl, {
    pos: 'before',
    className: 'GM-pagination-clone',
  });
  paginationRootWrap &&
    copyElementToNewRoot(catalogEl?.querySelectorAll('.pagination'), paginationRootWrap);

  // // Infinity scroll
  // // waitElement(el => {
  // //     return el?.classList?.contains('main-price');
  // //   }, () => {
  // //     init();
  // //   },
  // //   document.querySelector<HTMLElement>('lu-catalog-list .catalog-list'),
  // // );
  // waitCompletePage(
  //   () => {
  //     init();
  //     if (document.querySelector('lu-product-page')) {
  //       // routes
  //       initProductPage().catch(() => true)
  //
  //     }
  //
  //   },
  //   {
  //     root: document.querySelector<HTMLElement>(
  //       'lu-catalog-list .catalog-list' +
  //       ', lu-product-page'
  //
  //     ),
  //     delay: 500
  //   },
  // );
}

(function () {
  'use strict';
  if (!matchLocation('^https://lenta\\.com/.*')) {
    return;
  }
  GM_addStyle(`:root {
    --product-card-height-mobile: 384px !important;
    --products-slider-height: 400px !important;
  }`);
  console.log('Lenta.com');
  waitCompletePage(
    () => {
      if (matchLocation('^https://lenta\\.com/product/.*')) {
        initProductPage();
      }

      if (matchLocation('^https://lenta\\.com/(catalog|search|brand|product)/.*')) {
        initCatalog();
      }
    },
    {runOnce: false},
  );
})();
