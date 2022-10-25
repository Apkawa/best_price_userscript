import {matchLocation, waitCompletePage} from '../../utils';
import {getPriceFromElement} from '../common/price_parse';
import {parseTitleWithPrice} from '../common/parseTitle';
import {renderBestPrice} from '../common/price_render';
import {storeParsedTitleToElement} from '../common';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {ElementGetOrCreate} from '../../utils/dom';

export function initProductPage(): void {
  const init = () => {
    const productWrapEl = document.querySelector('.product_main_info');
    if (!productWrapEl) return;

    const title = productWrapEl?.querySelector('h1.main_header')?.textContent?.trim();
    const price = parseFloat(
      productWrapEl?.querySelector<HTMLMetaElement>('.product-price > meta[itemprop="price"]')
        ?.content || '',
    );
    if (!price || !title) return;
    console.log(title, price);
    const parsedTitle = parseTitleWithPrice(title, price);
    productWrapEl?.querySelector('.product-price')?.after(renderBestPrice(parsedTitle));
  };
  waitCompletePage(() => {
    init();
  });
}

function processProductCard(cardEl: HTMLElement): void {
  if (cardEl.classList.contains('GM-best-price-wrap')) return;
  const priceEl = cardEl?.querySelector<HTMLElement>('.price_and_cart .product-price');
  const price = getPriceFromElement(priceEl?.querySelector<HTMLElement>(':scope > span.price'));
  const title = cardEl.querySelector('.product-name a')?.getAttribute('title')?.trim();

  if (!title || !price) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  console.log(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  priceEl?.after(renderBestPrice(parsedTitle));
  storeParsedTitleToElement(cardEl, parsedTitle);
}

export function initCatalog(): void {
  const init = () => {
    const cardList = document.querySelectorAll(
      '.product_listing_container li' +
        ', .also-products  li > div.product' +
        ', .similar-products  li > div.product' +
        ', .catalogEntryRecommendationWidget  li > div.product',
    );
    for (const cardEl of cardList) {
      processProductCard(cardEl as HTMLElement);
    }
    // Reorder
    const catalogWrapEl = document.querySelector<HTMLElement>('.product_listing_container > ul');
    const buttonWrapEl = ElementGetOrCreate(catalogWrapEl, {
      pos: 'before',
    });
    if (catalogWrapEl && buttonWrapEl) {
      initReorderCatalog(catalogWrapEl, buttonWrapEl);
    }

    waitCompletePage(() => {
      init();
    });
  };

  waitCompletePage(() => {
    init();
  });
}

(function () {
  'use strict';
  if (!matchLocation('^https://(www\\.|)okeydostavka.ru/.*')) {
    return;
  }

  if (document.querySelector('.product_main_info')) {
    initProductPage();
  }

  initCatalog();
})();
