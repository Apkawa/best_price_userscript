import {parseTitleWithPrice} from '../common/parseTitle';
import {renderBestPrice} from '../common/price_render';
import {getElementByXpath, matchLocation, waitCompletePage} from '../../utils';
import {initReorderCatalog} from '../common/bestPriceReorder';
import {getPriceFromElement} from '../common/price_parse';
import {copyElementToNewRoot} from '../../utils/dom';
import {readDataFromElement, storeDataToElement, storeParsedTitleToElement} from '../common/store';
import {processProductCard} from '../common/common_parser';

export function initProductPage(): void {
  const productRoot = document.querySelector<HTMLElement>('[data-widget="container"]');
  if (!productRoot) return;
  const title = document.querySelector("[data-widget='webProductHeading']")?.textContent;
  if (!title) {
    return;
  }
  processProductCard(productRoot, {
    price_sel: '[data-widget="webOzonAccountPrice"], [data-widget="webPrice"]',
    title_sel: '[data-widget="webProductHeading"]',
    to_render: {
      sel: '[data-widget="webPrice"]',
      pos: 'appendChild',
    },
    force: false,
  });
}

function processProductCardOld(cardEl: HTMLElement): void {
  const wrapEl = getElementByXpath('(a|div/a)/following-sibling::div[1]', cardEl);

  if (!wrapEl || wrapEl?.querySelector('.GM-best-price')) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }

  const price = getPriceFromElement(wrapEl.querySelector('div'));
  const titleEl = wrapEl.querySelector(
    'a span.tsBodyL, ' +
      'a span.tsBodyM:not([style]), ' + //
      'a span.tsBodyM[style="color:;"], ' + // Возможно вам понравится (в заказе)
      'a span.tsBody500Medium ' +
      '',
  );
  const title = titleEl?.textContent;
  if (!title || !price) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  console.log(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  titleEl?.before(renderBestPrice(parsedTitle));
  storeParsedTitleToElement(cardEl, parsedTitle);
}

export function initCatalog(): void {
  const cardList = document.querySelectorAll<HTMLElement>(
    '.widget-search-result-container > div > div' +
      ",[data-widget='skuLine'] > div:nth-child(2) > div" +
      ",[data-widget='skuGridSimple'] > div:nth-child(2) > div" + // Товары на главной
      ",[data-widget='skuGridSimple'] > div:nth-child(1) > div" + // Товары на главной
      ",[data-widget='skuLine'] > div:nth-child(1) > div" + // Промо без заголовка
      ",[data-widget='skuLineLR'] > div:nth-child(2) > div" +
      ",[data-widget='skuGrid'][style] > div:nth-child(2) > div" + // Возможно вам понравятся
      ",[data-widget='skuGrid'] > div:nth-child(2) > div" + // Похожие товары, рекомендуем также
      ",[data-widget='skuGrid']:not([style]) > div:nth-child(1) > div" + // -/- бесконечный скролл
      ",[data-widget='skuShelfGoods'] > div:nth-child(2) > div > div > div > div",
  );
  for (const cardEl of cardList) {
    processProductCardOld(cardEl);
  }

  let catalogEl = document.querySelector<HTMLElement>('.widget-search-result-container > div');
  const buttonWrapEl = document.querySelector<HTMLElement>('[data-widget="searchResultsSort"]');
  if (!catalogEl) {
    return;
  }
  const el = catalogEl.querySelector<HTMLElement>(':scope > div');
  const isDetailCatalog = el && getComputedStyle(el).gridColumnStart === 'span 12';
  if (isDetailCatalog) {
    // TODO reorder detail catalog like
    //  https://www.ozon.ru/category/besprovodnye-pylesosy-10657/
    console.warn('is detail catalog, reorder disabled');
  } else {
    // Бесконечный скролл создает кучу контейнеров по 12 товаров
    const catalogs = document.querySelectorAll<HTMLElement>(
      '.widget-search-result-container > div',
    );
    // Конец исправления
    const items: HTMLElement[] = [];
    for (const catEl of catalogs) {
      items.push(...catEl.querySelectorAll<HTMLElement>(':scope > div'));
      catEl.innerHTML = '';
    }
    // Исправляем проблему с битыми ссылками после пересортировки.
    console.log(readDataFromElement(catalogEl));
    if (!readDataFromElement(catalogEl)?.['cloned']) {
      const newCatEl = catalogEl.cloneNode(true) as HTMLElement;
      catalogEl.replaceWith(newCatEl);
      catalogEl = newCatEl;
      storeDataToElement(catalogEl, {cloned: true});
    }

    catalogEl.append(...items);
    // reorder
    buttonWrapEl && initReorderCatalog(catalogEl, buttonWrapEl);
  }
  // Copy paginator on top
  const paginator = document.querySelector<HTMLElement>(
    '[data-widget="megaPaginator"] > div:nth-child(2)',
  );
  const paginatorWrap = document.querySelector<HTMLElement>('.widget-search-result-container');
  if (paginator?.querySelector('a')) {
    paginatorWrap && copyElementToNewRoot(paginator, paginatorWrap, {pos: 'before'});
  }
}

(function () {
  'use strict';
  if (!matchLocation('^https://(www\\.|)ozon\\.ru/.*')) {
    return;
  }
  console.log('OZON.ru');

  waitCompletePage(
    () => {
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
    },
    {
      runOnce: false,
    },
  );
})();
