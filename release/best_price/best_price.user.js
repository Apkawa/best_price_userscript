// ==UserScript==
// @name         Best price helper for marketplace
// @namespace    http://tampermonkey.net/
// @description  Считаем стоимость за штуку/за кг/за л
// @author       Apkawa
// @license      MIT
// @icon         https://www.google.com/s2/favicons?domain=ozon.ru
// @match        https://ozon.ru/*
// @match        https://www.ozon.ru/*
// @match        https://lenta.com/*
// @match        https://okeydostavka.ru/*
// @match        https://www.okeydostavka.ru/*
// @match        https://perekrestok.ru/*
// @match        https://www.perekrestok.ru/*
// @match        https://wildberries.ru/*
// @match        https://www.wildberries.ru/*
// @homepage     https://github.com/Apkawa/best_price_userscript
// @homepageURL  https://github.com/Apkawa/best_price_userscript
// @supportURL   https://github.com/Apkawa/best_price_userscript/issues
// @downloadURL  https://gitverse.ru/api/repos/apkawa/best_price_userscript/raw/branch/release/release/best_price.user.js
// @updateURL    https://gitverse.ru/api/repos/apkawa/best_price_userscript/raw/branch/release/release/best_price.user.js
// ==/UserScript==
// src/utils/dom.ts
function getElementByXpath(xpath, root = document) {
  const e = document.evaluate(xpath, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  return e && e;
}
function waitElement(match, callback, root = document.body) {
  const observer = new MutationObserver((mutations) => {
    let matchFlag = false;
    mutations.forEach((mutation) => {
      if (!mutation.addedNodes)
        return;
      for (let i = 0;i < mutation.addedNodes.length; i++) {
        const node = mutation.addedNodes[i];
        matchFlag = match(node);
      }
    });
    if (matchFlag) {
      _stop();
      callback();
      _start();
    }
  });
  let isStarted = false;
  function _start() {
    if (isStarted) {
      return;
    }
    observer.observe(root || document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
    isStarted = true;
  }
  function _stop() {
    observer.disconnect();
    isStarted = false;
  }
  _start();
  return () => {
    _stop();
  };
}
function waitCompletePage(callback, options = {}) {
  const { root = document.body, runOnce = true, sync = true, delay = 150 } = options;
  let t;
  let lock = false;
  const run = () => {
    const stop = waitElement(() => true, () => {
      if (t)
        clearTimeout(t);
      t = setTimeout(() => {
        if (lock)
          return;
        lock = true;
        if (runOnce || sync) {
          stop();
        }
        callback();
        if (sync && !runOnce) {
          setTimeout(run, delay);
        }
        lock = false;
      }, delay);
    }, root);
    return stop;
  };
  return run();
}
function E(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);
  for (const [k, v] of Object.entries(attributes)) {
    element.setAttribute(k, v);
  }
  const fragment = document.createDocumentFragment();
  children.forEach((child) => {
    if (typeof child === "string") {
      child = document.createTextNode(child);
    }
    fragment.appendChild(child);
  });
  element.appendChild(fragment);
  return element;
}
function ElementGetOrCreate(root, options = {}) {
  const { className = "GM-wrap", pos = "appendChild" } = options;
  if (!root)
    return null;
  let wrapEl = root.parentElement?.querySelector(`.${className}`);
  if (!wrapEl) {
    wrapEl = E("div", { class: className });
    root[pos](wrapEl);
  }
  return wrapEl;
}
function copyElementToNewRoot(el, toRoot, options = {}) {
  const { className = "GM-cloned", pos = "appendChild" } = options;
  if (!el) {
    console.warn(`el is ${typeof el}`);
    return;
  }
  let elList = [];
  if (el instanceof HTMLElement) {
    elList = [el];
  } else {
    elList = el;
  }
  for (const e of toRoot.parentElement?.querySelectorAll(`.${className}`) || []) {
    e.remove();
  }
  for (const _el of elList) {
    const clonedEl = _el.cloneNode(true);
    clonedEl.classList.add(className);
    toRoot[pos](clonedEl);
  }
}
// src/utils/GM.ts
function GM_addStyle(css) {
  const style = document.getElementById("GM_addStyleBy8626") || (() => {
    const style2 = document.createElement("style");
    style2.type = "text/css";
    style2.id = "GM_addStyleBy8626";
    document.head.appendChild(style2);
    return style2;
  })();
  const sheet = style.sheet;
  sheet?.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
}
// node_modules/rxjs/_esm5/internal/util/isFunction.js
function isFunction(x) {
  return typeof x === "function";
}
// src/utils/location.ts
function matchLocation(...patterns) {
  const s = document.location.href;
  for (const p of patterns) {
    if (isFunction(p) && p(s)) {
      return true;
    }
    if (RegExp(p).test(s)) {
      return true;
    }
  }
  return false;
}

// src/utils/index.ts
function isRegexp(value) {
  return toString.call(value) === "[object RegExp]";
}
function mRegExp(regExps) {
  return RegExp(regExps.map((r) => {
    if (isRegexp(r)) {
      return r.source;
    }
    return r;
  }).join(""), "i");
}
function round(n, parts = 2) {
  const i = 10 ** parts;
  return Math.round(n * i) / i;
}
var entries = Object.entries;
var values = Object.values;

// src/utils/sort.ts
function byPropertiesOf(sortBy) {
  function compareByProperty(arg) {
    let key;
    let sortOrder = 1;
    if (typeof arg === "string" && arg.startsWith("-")) {
      sortOrder = -1;
      key = arg.substr(1);
    } else {
      key = arg;
    }
    return (a, b) => {
      const result = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
      return result * sortOrder;
    };
  }
  return (obj1, obj2) => {
    let i = 0;
    let result = 0;
    const numberOfProperties = sortBy?.length;
    while (result === 0 && i < numberOfProperties) {
      result = compareByProperty(sortBy[i])(obj1, obj2);
      i++;
    }
    return result;
  };
}
function sort(arr, ...sortBy) {
  arr.sort(byPropertiesOf(sortBy));
}

// src/best_price/common/constants.ts
var BEST_PRICE_CLASS_NAME = "GM-best-price";
var BEST_PRICE_WRAP_CLASS_NAME = "GM-best-price-wrap";
var ORDER_NAME_LOCAL_STORAGE = "GM-best-price-default-order";
var MAX_NUMBER = 99999999999;

// src/best_price/common/store.ts
var PREFIX = "bp_";
function storeParsedTitleToElement(cardEl, parsedTitle) {
  cardEl.classList.add(BEST_PRICE_WRAP_CLASS_NAME);
  if (!parsedTitle)
    return;
  storeDataToElement(cardEl, parsedTitle);
}
function storeDataToElement(el, data) {
  const ds = el.dataset;
  for (const [k, v] of entries(data)) {
    ds[PREFIX + k] = JSON.stringify(v);
  }
}
function readDataFromElement(el) {
  const pairs = Object.entries(el.dataset).map(([k, v]) => {
    if (k.startsWith(PREFIX)) {
      return [k.replace(RegExp(`^${PREFIX}`), ""), JSON.parse(v || "")];
    }
    return [null, null];
  }).filter(([k]) => k);
  if (pairs.length > 0) {
    return Object.fromEntries(pairs);
  }
  return {};
}
function loadParsedTitleFromElement(cardEl) {
  const pairs = Object.entries(cardEl.dataset).map(([k, v]) => {
    if (k.startsWith(PREFIX)) {
      return [k.replace(RegExp(`^${PREFIX}`), ""), JSON.parse(v || "")];
    }
    return [null, null];
  }).filter(([k]) => k);
  if (pairs.length > 0) {
    return Object.fromEntries(pairs);
  }
  return null;
}

// src/best_price/common/bestPriceReorder.ts
var BEST_ORDER_BUTTON_CLASS_NAME = "GM-best-price-button-wrap";
function addStyles() {
  GM_addStyle(`button.${BEST_ORDER_BUTTON_CLASS_NAME} {
border: 1px solid gray !important; padding: 5px !important; margin: 3px !important; }
`);
  GM_addStyle(`button.${BEST_ORDER_BUTTON_CLASS_NAME}.active { border: 2px solid red !important; }`);
}
addStyles();
function initReorderCatalog(catalogRoot, buttonRoot) {
  const buttonWrap = buttonRoot;
  if (!buttonWrap)
    return;
  const catalogRecords = [];
  let i = 0;
  for (const wrapEl of catalogRoot.querySelectorAll(":scope > *")) {
    const el = wrapEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME) ? wrapEl : wrapEl.querySelector(`.${BEST_PRICE_WRAP_CLASS_NAME}`);
    if (!el) {
      console.warn("!", el);
      continue;
    }
    const ds = {
      initial_order: "0",
      ...loadParsedTitleFromElement(el)
    };
    if (!ds) {
      continue;
    }
    i += 1;
    let initial_order = parseInt(ds.initial_order || "0", 10);
    if (!initial_order) {
      initial_order = i;
      ds.initial_order = i.toString();
      storeDataToElement(el, { initial_order: i });
    }
    const record = {
      el: wrapEl,
      initial_order,
      weight_price: ds.units?.[0]?.price ? ds.units[0].price : MAX_NUMBER,
      quantity_price: ds.quantity_price ? ds.quantity_price : MAX_NUMBER
    };
    catalogRecords.push(record);
    console.debug("Catalog order record: ", record);
  }
  const buttons = {
    initial_order: E("button", { class: BEST_ORDER_BUTTON_CLASS_NAME }, "Reset"),
    weight_price: E("button", { class: BEST_ORDER_BUTTON_CLASS_NAME }, "by Weight"),
    quantity_price: E("button", { class: BEST_ORDER_BUTTON_CLASS_NAME }, "by Quantity")
  };
  function buttonClickHandler(orderState) {
    console.log(orderState);
    localStorage.setItem(ORDER_NAME_LOCAL_STORAGE, orderState);
    sort(catalogRecords, orderState);
    refreshCatalog();
    setActiveButton(buttons[orderState]);
  }
  for (const [k, b] of entries(buttons)) {
    b.onclick = () => {
      buttonClickHandler(k);
    };
  }
  const defaultOrder = localStorage.getItem(ORDER_NAME_LOCAL_STORAGE);
  if (defaultOrder) {
    if (defaultOrder === "initial_order") {
      setActiveButton(buttons[defaultOrder]);
    } else {
      buttonClickHandler(defaultOrder);
    }
  }
  function refreshCatalog() {
    const wrap = catalogRoot;
    if (!wrap)
      return;
    const elements = document.createDocumentFragment();
    for (const c of catalogRecords) {
      elements.appendChild(c.el);
    }
    wrap.innerHTML = "";
    wrap.appendChild(elements);
  }
  function setActiveButton(button) {
    for (const b of values(buttons)) {
      b.classList.remove("active");
    }
    button.classList.add("active");
  }
  buttonWrap.querySelector(`.${BEST_ORDER_BUTTON_CLASS_NAME}`)?.remove();
  buttonWrap.appendChild(E("div", { class: BEST_ORDER_BUTTON_CLASS_NAME }, ...values(buttons)));
}

// src/best_price/common/parseTitle.ts
var WORD_BOUNDARY_END = /(?=\s+|[.,);/]|[хx]|[^\u0400-\u04ff]|$)/;
var WEIGHT_REGEXP = mRegExp([
  /(?<value>\d+[,.]\d+|\d+)/,
  /\s?/,
  "(?<unit>",
  "(?<weight_unit>(?<weight_SI>кг|килограмм(?:ов|а|))|г|грамм(?:ов|а|)|гр)",
  "|(?<volume_unit>(?<volume_SI>л|литр(?:ов|а|))|мл)",
  "|(?<length_unit>(?<length_SI>м|метр(?:ов|а|)))",
  ")\\.?",
  WORD_BOUNDARY_END
]);
function plural(name, plurals = ["ок", "ки", "ка"]) {
  return `${name}(?:${plurals.join("|")})`;
}
var QUANTITY_UNITS = [
  "шт",
  "рулон",
  "пакет",
  "уп",
  plural("упаков"),
  plural("салфет"),
  "таб",
  "капсул",
  plural("флакон", ["", "a", "ов"]),
  plural("пар", ["", "a", "ы"])
];
var QUANTITY_REGEXP = RegExp(`(?<quantity>\\d+)\\s?(?<quantity_unit>${QUANTITY_UNITS.join("|")})\\.?`);
var QUANTITY_2_REGEXP = RegExp(`(?<quantity_2>\\d+)\\s?(?<quantity_2_unit>${QUANTITY_UNITS.join("|")})\\.?`);
var COMBINE_DELIMETER_REGEXP = /\s*?(?:[xх*×/]|по)\s*?/;
var COMBINE_QUANTITY_LIST = [
  mRegExp([/(?<quantity_2>\d+)/, COMBINE_DELIMETER_REGEXP, QUANTITY_REGEXP]),
  mRegExp([QUANTITY_REGEXP, COMBINE_DELIMETER_REGEXP, /(?<quantity_2>\d+)/]),
  mRegExp([QUANTITY_2_REGEXP, COMBINE_DELIMETER_REGEXP, QUANTITY_REGEXP])
];
var COMBINE_QANTITY_WEIGHT_REGEXP_LIST = [
  mRegExp([WEIGHT_REGEXP, COMBINE_DELIMETER_REGEXP, QUANTITY_REGEXP]),
  mRegExp([QUANTITY_REGEXP, COMBINE_DELIMETER_REGEXP, WEIGHT_REGEXP]),
  mRegExp([/(?<quantity>\d+)/, COMBINE_DELIMETER_REGEXP, WEIGHT_REGEXP]),
  mRegExp([WEIGHT_REGEXP, COMBINE_DELIMETER_REGEXP, /(?<quantity>\d+)/])
];
function parseGroups(groups, allowSum = true) {
  const result = {
    quantity: 1,
    units: []
  };
  if (groups.value) {
    const valueStr = groups?.value;
    const unit = groups?.unit;
    if (valueStr && unit) {
      let value = parseFloat(valueStr.replace(",", "."));
      let unit2 = null;
      if (groups.weight_unit) {
        if (!groups.weight_SI) {
          value /= 1000;
        }
        unit2 = "кг";
      }
      if (groups.volume_unit) {
        if (!groups.volume_SI) {
          value /= 1000;
        }
        unit2 = "л";
      }
      if (groups.length_unit) {
        if (!groups.length_SI) {
          value /= 1000;
        }
        unit2 = "м";
      }
      if (!unit2) {
        throw "Unknown unit";
      }
      result.units.push({
        unit: unit2,
        value,
        total: value
      });
    }
  }
  if (groups.quantity) {
    const valueStr = groups?.quantity;
    if (valueStr) {
      result.quantity = parseInt(valueStr, 10);
    }
  }
  if (allowSum && result.quantity > 1) {
    for (const u of result.units) {
      u.total = result.quantity * u.value;
    }
  }
  return result;
}
function parseTitle(title) {
  for (const r of COMBINE_QANTITY_WEIGHT_REGEXP_LIST) {
    const rMatch = r.exec(title);
    if (rMatch) {
      return parseGroups(rMatch.groups);
    }
  }
  let groups = {};
  const weightMatch = WEIGHT_REGEXP.exec(title);
  if (weightMatch?.groups) {
    groups = weightMatch.groups;
  }
  let quantity = 0;
  for (const r of COMBINE_QUANTITY_LIST) {
    const rMatch = r.exec(title)?.groups;
    if (rMatch?.quantity && rMatch?.quantity_2) {
      quantity = parseInt(rMatch.quantity, 10) * parseInt(rMatch.quantity_2, 10);
      break;
    }
  }
  if (quantity) {
    groups.quantity = quantity.toString();
  } else {
    const quantityMatch = QUANTITY_REGEXP.exec(title);
    if (quantityMatch?.groups) {
      groups = { ...groups, ...quantityMatch.groups };
    }
  }
  let allowSum = true;
  if (groups?.value) {
    allowSum = false;
  }
  return parseGroups(groups, allowSum);
}
function parseTitleWithPrice(title, price) {
  const { units, ...titleParsed } = parseTitle(title);
  const res = {
    ...titleParsed,
    units: [],
    quantity_price: null,
    quantity_price_display: null
  };
  if ((!res.quantity || res.quantity === 1) && !units.length) {
    return null;
  }
  for (const u of units) {
    const p = round(price / u.total);
    res.units.push({
      ...u,
      price: p,
      price_display: `${p} ₽/${u.unit || "?"}`
    });
  }
  if (res.quantity > 1) {
    res.quantity_price = round(price / res.quantity);
    res.quantity_price_display = `${res.quantity_price} ₽/шт`;
  }
  return res;
}

// src/best_price/common/price_parse.ts
function parsePrice(text) {
  text = text.split("₽")[0]?.trim();
  if (!text) {
    return null;
  }
  text = text.replace("&thinsp;", "").replace(" ", "").replace(" ", "").replace(/\s/g, "");
  const price = text.match(/\d+(\s*[,.]\s*\d+)?/)?.[0].trim();
  if (price) {
    return parseFloat(price);
  }
  return null;
}
function getPriceFromElement(el) {
  const priceText = el?.textContent?.trim();
  if (priceText) {
    return parsePrice(priceText);
  }
  return null;
}
function getPrice(sel, root2 = document.body) {
  const priceEl = (root2 || document.body).querySelector(sel);
  return getPriceFromElement(priceEl);
}

// src/best_price/common/price_render.ts
function renderBestPrice(titleInfo, extraStyle = {}) {
  const wrapEl = document.createElement("div");
  wrapEl.className = BEST_PRICE_CLASS_NAME;
  if (!titleInfo) {
    return wrapEl;
  }
  for (const u of titleInfo.units) {
    const el = document.createElement("p");
    el.innerHTML = u.price_display;
    wrapEl.appendChild(el);
  }
  if (titleInfo.quantity_price_display) {
    const qtyEl = document.createElement("p");
    qtyEl.innerHTML = titleInfo.quantity_price_display;
    wrapEl.appendChild(qtyEl);
  }
  if (wrapEl.childNodes.length) {
    wrapEl.style.border = "1px solid red";
    wrapEl.style.padding = "5px";
    wrapEl.style.margin = "5px";
    wrapEl.style.width = "fit-content";
    for (const [k, v] of entries(extraStyle || {})) {
      if (typeof v === "string") {
        wrapEl.style[k] = v;
      }
    }
  }
  return wrapEl;
}

// src/best_price/common/common_parser.ts
function processProductCard(cardEl, options) {
  const { price_sel, title_sel, to_render, force } = options;
  if (!force && cardEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME))
    return;
  const price = getPrice(price_sel, cardEl);
  const title = cardEl.querySelector(title_sel)?.textContent?.trim();
  if (!title || !price) {
    console.warn("Not found price or title", title, price, cardEl);
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  console.debug(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  const renderedPrice = renderBestPrice(parsedTitle, options.extra_style);
  let to_render_sel = "";
  let to_render_pos = "after";
  if (typeof to_render === "string") {
    to_render_sel = to_render;
  } else {
    to_render_sel = to_render.sel;
    to_render_pos = to_render.pos || to_render_pos;
  }
  const to_render_els = cardEl.querySelectorAll(to_render_sel);
  for (const to_render_el of to_render_els) {
    for (const e of to_render_el?.parentElement?.querySelectorAll(`.${BEST_PRICE_CLASS_NAME}`) || []) {
      e.remove();
    }
  }
  let i = 0;
  for (const to_render_el of to_render_els) {
    let r = renderedPrice;
    if (i > 0) {
      r = renderedPrice.cloneNode(true);
    }
    to_render_el?.[to_render_pos](r);
    i += 1;
  }
  storeParsedTitleToElement(cardEl, parsedTitle);
}

// src/best_price/sites/ozon_ru.ts
function initProductPage() {
  const productRoot = document.querySelector('[data-widget="container"]');
  if (!productRoot)
    return;
  const title = document.querySelector("[data-widget='webProductHeading']")?.textContent;
  if (!title) {
    return;
  }
  processProductCard(productRoot, {
    price_sel: '[data-widget="webOzonAccountPrice"], [data-widget="webPrice"]',
    title_sel: '[data-widget="webProductHeading"]',
    to_render: {
      sel: '[data-widget="webPrice"]',
      pos: "appendChild"
    },
    force: false
  });
}
function processProductCardOld(cardEl) {
  const wrapEl = getElementByXpath("(a|div/a)/following-sibling::div[1]", cardEl);
  if (!wrapEl || wrapEl?.querySelector(".GM-best-price")) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  const price = getPriceFromElement(wrapEl.querySelector("div"));
  const titleEl = wrapEl.querySelector("a span.tsBodyL, " + "a span.tsBodyM:not([style]), " + 'a span.tsBodyM[style="color:;"], ' + "a span.tsBody500Medium " + "");
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
function initCatalog() {
  const cardList = document.querySelectorAll(".widget-search-result-container > div > div" + ", #contentScrollPaginator div[data-widget='tileGridDesktop'] > div > div" + ",[data-widget='skuLine'] > div:nth-child(2) > div" + ",[data-widget='skuGridSimple'] > div:nth-child(2) > div" + ",[data-widget='skuGridSimple'] > div:nth-child(1) > div" + ",[data-widget='skuLine'] > div:nth-child(1) > div" + ",[data-widget='skuLineLR'] > div:nth-child(2) > div" + ",[data-widget='skuGrid'][style] > div:nth-child(2) > div" + ",[data-widget='skuGrid'] > div:nth-child(2) > div" + ",[data-widget='skuGrid']:not([style]) > div:nth-child(1) > div" + ",[data-widget='skuShelfGoods'] > div:nth-child(2) > div > div > div > div");
  for (const cardEl of cardList) {
    processProductCardOld(cardEl);
  }
  const catalogSel = "#contentScrollPaginator div[data-widget='tileGridDesktop'] > div:nth-child(1)";
  let catalogEl = document.querySelector(catalogSel);
  if (!catalogEl) {
    return;
  }
  const buttonWrapEl = ElementGetOrCreate(document.querySelector("#paginator"), {
    className: "GM-button-wrap",
    pos: "before"
  });
  const el = catalogEl.querySelector(":scope > div");
  const isDetailCatalog = el && getComputedStyle(el).gridColumnStart === "span 12";
  if (isDetailCatalog) {
    console.warn("is detail catalog, reorder disabled");
  } else {
    const catalogs = document.querySelectorAll(catalogSel);
    const items = [];
    for (const catEl of catalogs) {
      items.push(...catEl.querySelectorAll(":scope > div"));
      catEl.innerHTML = "";
    }
    if (!readDataFromElement(catalogEl)?.cloned) {
      const newCatEl = catalogEl.cloneNode(true);
      catalogEl.replaceWith(newCatEl);
      catalogEl = newCatEl;
      storeDataToElement(catalogEl, { cloned: true });
    }
    catalogEl.append(...items);
    buttonWrapEl && initReorderCatalog(catalogEl, buttonWrapEl);
  }
  const paginator = document.querySelector('[data-widget="megaPaginator"] > div:nth-child(2)');
  const paginatorWrap = document.querySelector(".widget-search-result-container");
  if (paginator?.querySelector("a")) {
    paginatorWrap && copyElementToNewRoot(paginator, paginatorWrap, { pos: "before" });
  }
}
(() => {
  if (!matchLocation("^https://(www\\.|)ozon\\.ru/.*")) {
    return;
  }
  console.log("OZON.ru");
  waitCompletePage(() => {
    if (matchLocation("^https://(www\\.|)ozon\\.ru/product/.*")) {
      initProductPage();
    }
    if (matchLocation("^https://(www\\.|)ozon\\.ru/")) {
      initCatalog();
    }
    if (matchLocation("^https://(www\\.|)ozon\\.ru/(category|highlight|search|my|product|brand)/.*")) {
      initCatalog();
    }
  }, {
    runOnce: false
  });
})();

// src/best_price/sites/lenta_com.ts
function initProductPage2() {
  const productRoot = document.querySelector("lu-product-page-new");
  if (!productRoot) {
    console.error("not found product detail");
    return;
  }
  processProductCard(productRoot, {
    price_sel: ".product-price .main-price",
    title_sel: "lu-product-page-name-new h1",
    to_render: {
      sel: "lu-availability-product-detail",
      pos: "before"
    },
    force: false
  });
}
function processProductCardCatalog(cardEl) {
  if (cardEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME))
    return;
  const price = getPriceFromElement(cardEl.querySelector(".product-price .main-price"));
  const title = cardEl.querySelector(".lu-product-card-name")?.textContent?.trim();
  if (!title || !price) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  console.log(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  cardEl?.appendChild(renderBestPrice(parsedTitle));
  storeParsedTitleToElement(cardEl, parsedTitle);
}
function initCatalog2() {
  const cardList = document.querySelectorAll("lu-grid .lu-grid__item:has(:not(lu-placeholder))" + ",lu-slider .product-card:has(:not(lu-placeholder))");
  for (const cardEl of cardList) {
    processProductCardCatalog(cardEl);
  }
  const catalogWrapEl = document.querySelector("lu-grid > div");
  const buttonWrapEl = ElementGetOrCreate(document.querySelector(".catalog-list"), {
    pos: "before"
  });
  if (catalogWrapEl && buttonWrapEl) {
    initReorderCatalog(catalogWrapEl, buttonWrapEl);
  }
  const catalogEl = document.querySelector("lu-listing .catalog-list");
  const paginationRootWrap = ElementGetOrCreate(catalogEl, {
    pos: "before",
    className: "GM-pagination-clone"
  });
  paginationRootWrap && copyElementToNewRoot(catalogEl?.querySelectorAll(".pagination"), paginationRootWrap);
}
(() => {
  if (!matchLocation("^https://lenta\\.com/.*")) {
    return;
  }
  GM_addStyle(`:root {
    --product-card-height-mobile: 384px !important;
    --products-slider-height: 400px !important;
  }`);
  console.log("Lenta.com");
  waitCompletePage(() => {
    if (matchLocation("^https://lenta\\.com/product/.*")) {
      initProductPage2();
    }
    if (matchLocation("^https://lenta\\.com/(catalog|search|brand|product)/.*")) {
      initCatalog2();
    }
  }, { runOnce: false });
})();

// src/best_price/sites/okeydostavka_ru.ts
function initProductPage3() {
  const init = () => {
    const productWrapEl = document.querySelector(".product_main_info");
    if (!productWrapEl)
      return;
    const title = productWrapEl?.querySelector("h1.main_header")?.textContent?.trim();
    const price = parseFloat(productWrapEl?.querySelector('.product-price > meta[itemprop="price"]')?.content || "");
    if (!price || !title)
      return;
    console.log(title, price);
    const parsedTitle = parseTitleWithPrice(title, price);
    productWrapEl?.querySelector(".product-price")?.after(renderBestPrice(parsedTitle));
  };
  waitCompletePage(() => {
    init();
  });
}
function processProductCard2(cardEl) {
  if (cardEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME))
    return;
  const priceEl = cardEl?.querySelector(".price_and_cart .product-price");
  const price = getPriceFromElement(priceEl?.querySelector(":scope > span.price"));
  const title = cardEl.querySelector(".product-name a")?.getAttribute("title")?.trim();
  if (!title || !price) {
    storeParsedTitleToElement(cardEl, null);
    return;
  }
  console.log(title, price);
  const parsedTitle = parseTitleWithPrice(title, price);
  const productEl = cardEl?.querySelector(".product") || cardEl;
  productEl?.appendChild(renderBestPrice(parsedTitle));
  cardEl.querySelectorAll("[onclick^='gtm']").forEach((el) => {
    el.removeAttribute("onclick");
  });
  storeParsedTitleToElement(cardEl, parsedTitle);
}
function initCatalog3() {
  const init = () => {
    const cardList = document.querySelectorAll(".product_listing_container li" + ", .also-products  li > div.product" + ", .similar-products  li > div.product" + ", .catalogEntryRecommendationWidget  li > div.product");
    for (const cardEl of cardList) {
      processProductCard2(cardEl);
    }
    const catalogWrapEl = document.querySelector(".product_listing_container > ul");
    const buttonWrapEl = ElementGetOrCreate(catalogWrapEl, {
      pos: "before"
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
(() => {
  if (!matchLocation("^https://(www\\.|)okeydostavka.ru/.*")) {
    return;
  }
  if (document.querySelector(".product_main_info")) {
    initProductPage3();
  }
  initCatalog3();
})();

// src/best_price/sites/auchan_ru.ts
function initProductPage4() {
  const init = () => {
    if (document.querySelector("main .GM-best-price"))
      return;
    const title = document.querySelector("main h1#productName")?.textContent?.trim();
    const price = getPrice("main .fullPricePDP");
    if (!price || !title)
      return;
    console.log(title, price);
    const parsedTitle = parseTitleWithPrice(title, price);
    document.querySelector("main .fullPricePDP")?.after(renderBestPrice(parsedTitle));
  };
  init();
}
function processProductCard3(cardEl, priceSel, titleSel, renderPriceSel) {
  if (cardEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME))
    return;
  const price = getPriceFromElement(cardEl.querySelector(priceSel));
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
function initCatalog4() {
  const init = () => {
    const cardList = document.querySelectorAll("article.productCard");
    for (const cardEl of cardList) {
      processProductCard3(cardEl, ".productCardPriceData > div", ".linkToPDP", ".productCardPriceData ");
    }
    const catalogWrapEl = getElementByXpath('//article[contains(@class,"productCard")]/ancestor::main//article/../..');
    if (!document.querySelector(".GM-wrap")) {
      const buttonWrapEl = ElementGetOrCreate(document.querySelector("#categoriesThirdLvlList"), {
        pos: "after"
      });
      if (catalogWrapEl && buttonWrapEl) {
        initReorderCatalog(catalogWrapEl, buttonWrapEl);
      }
    }
    const catalogEl = document.querySelector(".catalog-view__main");
    const paginationRootWrap = ElementGetOrCreate(catalogEl, {
      pos: "before",
      className: "GM-pagination-clone"
    });
    paginationRootWrap && copyElementToNewRoot(catalogEl?.querySelectorAll(".pagination"), paginationRootWrap);
  };
  init();
}
function initSearchResults() {
  const cardList = document.querySelectorAll(".digi-product");
  for (const cardEl of cardList) {
    processProductCard3(cardEl, ".digi-product-price-variant_actual", ".digi-product__label", ".price-and-cart");
  }
  const catalogWrapEl = document.querySelector(".digi-products-grid");
  if (!document.querySelector(".digi-search .GM-wrap")) {
    const buttonWrapEl = ElementGetOrCreate(document.querySelector(".digi-main-results-actions"), {
      pos: "after"
    });
    if (catalogWrapEl && buttonWrapEl) {
      initReorderCatalog(catalogWrapEl, buttonWrapEl);
    }
  }
}
(() => {
  if (!matchLocation("^https://(www\\.|)auchan\\.ru/.*")) {
    return;
  }
  console.log("Auchan.ru");
  waitCompletePage(() => {
    if (document.querySelector("#productName")) {
      initProductPage4();
    } else {
      if (document.querySelector(".digi-product")) {
        initSearchResults();
      } else {
        initCatalog4();
      }
    }
  }, {
    runOnce: false
  });
})();

// src/best_price/sites/perekrestok_ru.ts
function initProductPage5() {
  const productRoot = document.querySelector("main");
  if (!productRoot)
    return;
  const productId = productRoot.querySelector('[itemprop="sku"]')?.getAttribute("content");
  if (productId && productRoot.dataset.productId !== productId) {
    productRoot.classList.remove(BEST_PRICE_WRAP_CLASS_NAME);
    productRoot.dataset.productId = productId;
  }
  processProductCard(productRoot, {
    price_sel: "div.price-new",
    title_sel: "h1.product__title",
    to_render: { sel: "div.price-new", pos: "after" }
  });
}
function initCatalog5() {
  const cardList = document.querySelectorAll(".product-card-wrapper" + ", .swiper-slide");
  for (const cardEl of cardList) {
    processProductCard(cardEl, {
      price_sel: "div.price-new",
      title_sel: "span.product-card__link-text",
      to_render: "div.product-card__control"
    });
  }
  for (const group of document.querySelectorAll(".catalog-content-group__list")) {
    const cards = group.querySelectorAll(":scope > div:not(.GM-fix) > div > div > div");
    const cardsWrap = ElementGetOrCreate(group, {
      className: "GM-fix"
    });
    for (const c of cards) {
      c.style.width = "220px";
      cardsWrap?.appendChild(c);
    }
    const buttonWrapEl = ElementGetOrCreate(group, {
      pos: "before"
    });
    if (buttonWrapEl && cardsWrap) {
      cardsWrap.style.display = "flex";
      cardsWrap.style.flexWrap = "wrap";
      initReorderCatalog(cardsWrap, buttonWrapEl);
    }
  }
}
(() => {
  const prefix = "https://(www\\.|)perekrestok\\.ru";
  if (!matchLocation(prefix))
    return;
  console.log("Perekrestok.ru");
  waitCompletePage(() => {
    if (matchLocation(`${prefix}/cat/\\d+/p/`)) {
      initProductPage5();
    }
    initCatalog5();
  }, { runOnce: false, delay: 300 });
})();

// src/best_price/sites/wildberries_ru.ts
var extraStyle = {
  fontSize: "1rem",
  color: "black"
};
function initProductPage6() {
  const productRoot = document.querySelector(".product-page");
  if (!productRoot)
    return;
  processProductCard(productRoot, {
    price_sel: ".price-block__final-price",
    title_sel: ".product-page__header h1",
    to_render: ".price-block",
    extra_style: extraStyle,
    force: true
  });
  const cardList = document.querySelectorAll(".product-card");
  for (const cardEl of cardList) {
    processProductCard(cardEl, {
      price_sel: ".price__lower-price",
      title_sel: ".product-card__name",
      to_render: ".product-card__price",
      extra_style: extraStyle
    });
  }
}
function initPopup() {
  const productPopupRoot = document.querySelector(".popup .product");
  if (!productPopupRoot)
    return;
  processProductCard(productPopupRoot, {
    price_sel: ".price-block__final-price",
    title_sel: ".product__header",
    to_render: ".price-block",
    extra_style: extraStyle
  });
}
function initCatalog6() {
  const cardList = document.querySelectorAll(".product-card");
  for (const cardEl of cardList) {
    processProductCard(cardEl, {
      price_sel: ".price__lower-price",
      title_sel: ".product-card__name",
      to_render: ".product-card__price",
      extra_style: extraStyle
    });
  }
  const catalogWrapEl = document.querySelector(".product-card-list");
  const buttonWrapEl = ElementGetOrCreate(document.querySelector(".catalog-page__main"), {
    pos: "before"
  });
  if (catalogWrapEl && buttonWrapEl) {
    initReorderCatalog(catalogWrapEl, buttonWrapEl);
  }
  const paginationRootWrap = ElementGetOrCreate(catalogWrapEl, {
    pos: "before",
    className: "GM-pagination-clone"
  });
  paginationRootWrap && copyElementToNewRoot(document.querySelectorAll(".pager-bottom:not(.GM-cloned)"), paginationRootWrap);
}
(() => {
  const prefix = "https://(www\\.|)wildberries\\.ru/";
  if (!matchLocation(prefix))
    return;
  console.debug("Wildberries.ru");
  waitCompletePage(() => {
    initProductPage6();
    initPopup();
    initCatalog6();
  }, { runOnce: false, delay: 200 });
})();
