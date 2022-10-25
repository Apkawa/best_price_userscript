import {parseTitleWithPrice} from '../common/parseTitle';
import {renderBestPrice} from '../common/price_render';
import {getElementByXpath, matchLocation, waitCompletePage} from '../../utils';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {getPrice, getPriceFromElement} from '../common/price_parse';
import {storeParsedTitleToElement} from '../common';

export function initProductPage(): void {
  const init = () => {
    const title = document.querySelector("[data-widget='webProductHeading']")?.textContent;
    if (!title) {
      return;
    }
    // Try green price first
    let price = getPrice("[data-widget='webOzonAccountPrice']");
    if (!price) {
      price = getPrice("[data-widget='webPrice']");
    }
    if (price) {
      const parsedTitle = parseTitleWithPrice(title, price);
      document.querySelector("[data-widget='webPrice']")?.appendChild(renderBestPrice(parsedTitle));
    }
  };
  waitCompletePage(() => {
    init();
  });
}

function processProductCard(cardEl: HTMLElement): void {
  const wrapEl = getElementByXpath('a/following-sibling::div[1]', cardEl);

  if (!wrapEl || wrapEl?.querySelector('.GM-best-price')) {
    return;
  }

  const price = getPriceFromElement(wrapEl.querySelector('div'));
  const titleEl = wrapEl.querySelector('a span.tsBodyL, a span.tsBodyM:not([style])');
  const title = titleEl?.textContent;
  if (!title || !price) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  console.log(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  titleEl?.parentElement?.insertBefore(renderBestPrice(parsedTitle), titleEl);
  storeParsedTitleToElement(cardEl, parsedTitle);
}

export function initCatalog(): void {
  const init = () => {
    const cardList = document.querySelectorAll(
      '.widget-search-result-container > div > div' +
        ",[data-widget='skuLine'] > div:nth-child(2) > div" +
        ",[data-widget='skuLine'] > div:nth-child(1) > div" + // Промо без заголовка
        ",[data-widget='skuLineLR'] > div:nth-child(2) > div" +
        ",[data-widget='skuGrid'] > div:nth-child(2) > div" + // Возможно вам понравятся
        ",[data-widget='skuShelfGoods'] > div:nth-child(2) > div > div > div > div",
    );
    for (const cardEl of cardList) {
      processProductCard(cardEl as HTMLElement);
    }

    const catalogEl = document.querySelector<HTMLElement>('.widget-search-result-container > div');
    const buttonWrapEl = document.querySelector<HTMLElement>('[data-widget="searchResultsSort"]');
    if (catalogEl) {
      buttonWrapEl && initReorderCatalog(catalogEl, buttonWrapEl);

      // Copy paginator on top
      const paginator = document.querySelector('[data-widget="megaPaginator"] > div:nth-child(2)');
      if (paginator?.querySelector('a')) {
        const nodes = paginator?.cloneNode(true);
        if (nodes) {
          (nodes as HTMLElement).classList.add('cloned-paginator');
          catalogEl.parentElement?.querySelector('.cloned-paginator')?.remove();
          catalogEl.before(nodes);
        }
      }
    }
  };

  waitCompletePage(
    () => {
      init();
    },
    {runOnce: false},
  );
}

(function () {
  'use strict';
  if (!matchLocation('^https://(www\\.|)ozon\\.ru/.*')) {
    return;
  }
  console.log('OZON.ru');
  if (matchLocation('^https://(www\\.|)ozon\\.ru/product/.*')) {
    initProductPage();
  }

  if (matchLocation('^https://(www\\.|)ozon\\.ru/')) {
    initCatalog();
  }
  if (
    matchLocation('^https://(www\\.|)ozon\\.ru/(category|highlight|search|my|product|brand)/.*')
  ) {
    initCatalog();
  }
})();
