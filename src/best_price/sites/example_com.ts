import {matchLocation, waitCompletePage} from '../../utils';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {copyElementToNewRoot, ElementGetOrCreate} from '../../utils/dom';
import {processProductCard} from '../common/common_parser';
import {BEST_PRICE_WRAP_CLASS_NAME} from '../common/constants';

export function initProductPage(): void {
  waitCompletePage(
    () => {
      const productRoot = document.querySelector<HTMLElement>('main');
      if (!productRoot) return;

      // Костыль из за кеширования, dom не перестраивается а только обноаляются значения
      const productId = productRoot.querySelector('[itemprop="sku"]')?.getAttribute('content');
      if (productId && productRoot.dataset.productId !== productId) {
        productRoot.classList.remove(BEST_PRICE_WRAP_CLASS_NAME);
        productRoot.dataset.productId = productId;
      }
      processProductCard(productRoot, {
        price_sel: 'div.price-new',
        title_sel: 'h1.product__title',
        to_render: {sel: 'div.price-new', pos: 'after'},
      });
    },
    {
      runOnce: false,
      delay: 300,
    },
  );
}

export function initCatalog(): void {
  const init = () => {
    const cardList = document.querySelectorAll<HTMLElement>(
      '.product-card-wrapper' + ', .swiper-slide',
    );
    for (const cardEl of cardList) {
      processProductCard(cardEl, {
        price_sel: 'div.price-new',
        title_sel: 'span.product-card__link-text',
        to_render: 'div.product-card__control',
      });
    }
    // Reorder buttons
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
    // Pagination
    const catalogEl = document.querySelector<HTMLElement>('.catalog-view__main');
    const paginationRootWrap = ElementGetOrCreate(catalogEl, {
      pos: 'before',
      className: 'GM-pagination-clone',
    });
    paginationRootWrap &&
      copyElementToNewRoot(catalogEl?.querySelectorAll('.pagination'), paginationRootWrap);

    // Reorder
    for (const group of document.querySelectorAll<HTMLElement>(
      '.catalog-content-group__list > div > div',
    )) {
      const buttonWrapEl = ElementGetOrCreate(group.parentElement, {
        pos: 'before',
      });
      if (buttonWrapEl) {
        initReorderCatalog(group, buttonWrapEl);
      }
    }
  };

  waitCompletePage(
    () => {
      init();
    },
    {runOnce: false, delay: 200},
  );
}

(function () {
  'use strict';
  console.error('No implemented');
  throw 'No implemented';
  const prefix = 'https://(www\\.|)example\\.com';
  if (!matchLocation(prefix)) return;
  if (matchLocation(prefix + '/product/')) {
    initProductPage();
  }
  initCatalog();
})();
