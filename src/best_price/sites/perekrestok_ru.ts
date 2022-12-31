import {matchLocation, waitCompletePage} from '../../utils';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {ElementGetOrCreate} from '../../utils/dom';
import {processProductCard} from '../common/common_parser';
import {BEST_PRICE_WRAP_CLASS_NAME} from '../common/constants';
import {SiteType} from './types';
import {buildPatternPrefixFromDomain} from '../../utils/location';

export function initProductPage(): void {
  const productRoot = document.querySelector<HTMLElement>('main');
  if (!productRoot) return;

  // Костыль из за кеширования, jsdom не перестраивается а только обноаляются значения
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
}

export function initCatalog(): void {
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

  // Reorder
  for (const group of document.querySelectorAll<HTMLElement>('.catalog-content-group__list')) {
    const cards = group.querySelectorAll<HTMLElement>(
      ':scope > div:not(.GM-fix) > div > div > div',
    );
    const cardsWrap = ElementGetOrCreate(group, {
      className: 'GM-fix',
    });
    for (const c of cards) {
      c.style.width = '220px';
      cardsWrap?.appendChild(c);
    }

    const buttonWrapEl = ElementGetOrCreate(group, {
      pos: 'before',
    });
    if (buttonWrapEl && cardsWrap) {
      cardsWrap.style.display = 'flex';
      cardsWrap.style.flexWrap = 'wrap';
      initReorderCatalog(cardsWrap, buttonWrapEl);
    }
  }
}

function setup() {
  'use strict';
  const prefix = buildPatternPrefixFromDomain(SITE.domain);
  waitCompletePage(
    () => {
      if (matchLocation(prefix + '/cat/\\d+/p/')) {
        initProductPage();
      }
      initCatalog();
    },
    {runOnce: false, delay: 300},
  );
}

const SITE: SiteType = {
  domain: 'perekrestok.ru',
  setup,
};

export default SITE;
