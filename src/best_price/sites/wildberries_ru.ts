import {matchLocation, waitCompletePage} from '../../utils';
import {ElementGetOrCreate, copyElementToNewRoot} from '../../utils/dom';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {processProductCard} from '../common/common_parser';

const extraStyle = {
  fontSize: '1rem',
  color: 'black',
};

export function initProductPage(): void {
  const productRoot = document.querySelector<HTMLElement>('.product-page');
  if (!productRoot) return;
  processProductCard(productRoot, {
    price_sel: '.price-block__final-price',
    title_sel: '.product-page__header h1',
    to_render: '.price-block',
    extra_style: extraStyle,
    force: true,
  });

  // Блок рекомендаций
  const cardList = document.querySelectorAll<HTMLElement>('.product-card');
  for (const cardEl of cardList) {
    processProductCard(cardEl, {
      price_sel: '.price__lower-price',
      title_sel: '.product-card__name',
      to_render: '.product-card__price',
      extra_style: extraStyle,
    });
  }
}

export function initPopup(): void {
  // Быстрый просмотр
  const productPopupRoot = document.querySelector<HTMLElement>('.popup .product');
  if (!productPopupRoot) return;
  processProductCard(productPopupRoot, {
    price_sel: '.price-block__final-price',
    title_sel: '.product__header',
    to_render: '.price-block',
    extra_style: extraStyle,
  });
}

export function initCatalog(): void {
  // Каталог
  const cardList = document.querySelectorAll<HTMLElement>('.product-card');
  for (const cardEl of cardList) {
    processProductCard(cardEl, {
      price_sel: '.price__lower-price',
      title_sel: '.product-card__name',
      to_render: '.product-card__price',
      extra_style: extraStyle,
    });
  }
  // Reorder buttons
  const catalogWrapEl = document.querySelector<HTMLElement>('.product-card-list');
  const buttonWrapEl = ElementGetOrCreate(
    document.querySelector<HTMLElement>('.catalog-page__main'),
    {
      pos: 'before',
    },
  );
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
}
(function () {
  'use strict';
  const prefix = 'https://(www\\.|)wildberries\\.ru/';
  if (!matchLocation(prefix)) return;
  console.debug('Wildberries.ru');
  waitCompletePage(
    () => {
      initProductPage();
      initPopup();
      initCatalog();
    },
    {runOnce: false, delay: 200},
  );
})();
