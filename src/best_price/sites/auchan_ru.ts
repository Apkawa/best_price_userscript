import {getElementByXpath, waitCompletePage} from '../../utils';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {copyElementToNewRoot, ElementGetOrCreate} from '../../utils/dom';
import {SiteType} from './types';
import {processProductCard} from '../common/common_parser';

export function initProductPage(): void {
  const productRoot = document.querySelector('main');
  if (!productRoot) return;
  processProductCard(productRoot, {
    price_sel: '.fullPricePDP',
    title_sel: 'h1#productName',
    to_render: {sel: '.fullPricePDP', pos: 'after'},
  });
}

export function initCatalog(): void {
  const cardList = document.querySelectorAll<HTMLElement>('article.productCard');
  for (const cardEl of cardList) {
    processProductCard(cardEl, {
      price_sel: '.productCardPriceData > div',
      title_sel: '.linkToPDP',
      to_render: '.productCardPriceData',
      force: true,
    });
  }
  // Reorder
  const catalogWrapEl = getElementByXpath('//article[contains(@class,"productCard")]/../..');
  const buttonWrapEl = ElementGetOrCreate(document.querySelector<HTMLElement>('main > div'), {
    pos: 'before',
  });
  buttonWrapEl.style.paddingLeft = '42px';
  if (catalogWrapEl && buttonWrapEl) {
    initReorderCatalog(catalogWrapEl, buttonWrapEl);
  }

  // Copy pagination on top
  const catalogEl = document.querySelector<HTMLElement>('.catalog-view__main');
  const paginationRootWrap = ElementGetOrCreate(catalogEl, {
    pos: 'before',
    className: 'GM-pagination-clone',
  });
  paginationRootWrap &&
    copyElementToNewRoot(catalogEl?.querySelectorAll('.pagination'), paginationRootWrap);
}

export function initSearchResults(): void {
  const cardList = document.querySelectorAll<HTMLElement>('.digi-product');
  for (const cardEl of cardList) {
    processProductCard(cardEl, {
      price_sel: '.digi-product-price-variant_actual',
      title_sel: '.digi-product__label',
      to_render: '.price-and-cart',
    });
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

function setup() {
  waitCompletePage(
    () => {
      if (document.querySelector('#productName')) {
        initProductPage();
      } else {
        if (document.querySelector('.digi-products .digi-product')) {
          initSearchResults();
        }
        initCatalog();
      }
    },
    {
      runOnce: false,
      delay: 450,
    },
  );
}

const SITE: SiteType = {
  domain: 'auchan.ru',
  setup,
};

export default SITE;
