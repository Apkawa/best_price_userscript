import {matchLocation, waitCompletePage} from '../../utils';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {copyElementToNewRoot, ElementGetOrCreate} from '../../utils/dom';
import {processProductCard} from '../common/common_parser';

const extraStyle = {
  fontSize: '1rem',
  color: 'black',
};
export function initProductPage(): void {
  waitCompletePage(
    () => {
      const productRoot = document.querySelector<HTMLElement>('.product-page');
      if (!productRoot) return;
      processProductCard(productRoot, {
        price_sel: '.price-block__final-price',
        title_sel: '.product-page__header h1',
        to_render: '.price-block',
        extra_style: extraStyle,
      });

      // Блок рекомендаций
      const cardList = document.querySelectorAll<HTMLElement>('.goods-card');
      for (const cardEl of cardList) {
        processProductCard(cardEl, {
          price_sel: '.goods-card__price-now',
          title_sel: '.goods-card__description',
          to_render: '.goods-card__price',
          extra_style: extraStyle,
        });
      }
    },
    {
      runOnce: false,
      delay: 300,
    },
  );
}

export function initCatalog(): void {
  const init = () => {
    // Быстрый просмотр
    const productPopupRoot = document.querySelector<HTMLElement>('.popup .product');
    if (!productPopupRoot) return;
    processProductCard(productPopupRoot, {
      price_sel: '.price-block__final-price',
      title_sel: '.product__header',
      to_render: '.price-block',
      extra_style: extraStyle,
    });

    // Каталог
    const cardList = document.querySelectorAll<HTMLElement>(
      '.product-card > .product-card__wrapper',
    );
    for (const cardEl of cardList) {
      processProductCard(cardEl, {
        price_sel: '.price__lower-price',
        title_sel: '.goods-name',
        to_render: '.product-card__price',
        extra_style: {
          fontSize: '1rem',
          color: 'black',
        },
      });
    }
    // Reorder buttons
    const catalogWrapEl = document.querySelector<HTMLElement>('.product-card-list');
    const buttonWrapEl = ElementGetOrCreate(document.querySelector<HTMLElement>('.inner-sorter'), {
      pos: 'before',
    });
    if (catalogWrapEl && buttonWrapEl) {
      initReorderCatalog(catalogWrapEl, buttonWrapEl);
    }
    // Pagination
    const paginationRootWrap = ElementGetOrCreate(catalogWrapEl, {
      pos: 'before',
      className: 'GM-pagination-clone',
    });
    paginationRootWrap &&
      copyElementToNewRoot(
        document.querySelectorAll('.pager-bottom:not(.GM-cloned)'),
        paginationRootWrap,
      );
  };

  waitCompletePage(
    () => {
      init();
    },
    {runOnce: false, delay: 300},
  );
}

(function () {
  'use strict';
  const prefix = 'https://(www\\.|)wildberries\\.ru';
  if (!matchLocation(prefix)) return;
  initProductPage();
  initCatalog();
})();
