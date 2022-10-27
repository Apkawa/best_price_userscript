// ==UserScript==
// @name         Best price helper for marketplace
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Считаем стоимость за штуку/за кг/за л
// @author       Apkawa
// @license      MIT
// @icon         https://www.google.com/s2/favicons?domain=ozon.ru
// @match        https://ozon.ru/*
// @match        https://www.ozon.ru/*
// @match        https://lenta.com/*
// @match        https://okeydostavka.ru/*
// @match        https://www.okeydostavka.ru/*
// @homepage     https://github.com/Apkawa/userscripts
// @homepageUrl  https://github.com/Apkawa/userscripts
// @supportUrl   https://github.com/Apkawa/userscripts/issues
// @downloadUrl  https://github.com/Apkawa/userscripts/raw/master/dist/best_price/best_price.user.js
// @updateUrl    https://github.com/Apkawa/userscripts/raw/master/dist/best_price/best_price.user.js
// ==/UserScript==
(function() {
    "use strict";
    function getElementByXpath(xpath, root = document) {
        const e = document.evaluate(xpath, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return e && e;
    }
    function waitElement(match, callback, root = document.body) {
        const observer = new MutationObserver((mutations => {
            let matchFlag = false;
            mutations.forEach((mutation => {
                if (!mutation.addedNodes) return;
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    matchFlag = match(node);
                }
            }));
            if (matchFlag) {
                _stop();
                callback();
                _start();
            }
        }));
        let isStarted = false;
        function _start() {
            if (isStarted) return;
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
        const {root: root = document.body, runOnce: runOnce = true, sync: sync = true} = options;
        let t = null;
        let lock = false;
        const run = () => {
            const stop = waitElement((() => true), (() => {
                if (t) clearTimeout(t);
                t = setTimeout((() => {
                    if (lock) return;
                    lock = true;
                    if (runOnce || sync) stop();
                    callback();
                    if (sync && !runOnce) setTimeout(run, 100);
                    lock = false;
                }), 150);
            }), root);
            return stop;
        };
        return run();
    }
    function E(tag, attributes = {}, ...children) {
        const element = document.createElement(tag);
        for (const [k, v] of Object.entries(attributes)) element.setAttribute(k, v);
        const fragment = document.createDocumentFragment();
        children.forEach((child => {
            if ("string" === typeof child) child = document.createTextNode(child);
            fragment.appendChild(child);
        }));
        element.appendChild(fragment);
        return element;
    }
    function ElementGetOrCreate(root, options = {}) {
        var _a;
        const {className: className = "GM-wrap", pos: pos = "appendChild"} = options;
        if (!root) return null;
        let wrapEl = null === (_a = root.parentElement) || void 0 === _a ? void 0 : _a.querySelector("." + className);
        if (!wrapEl) {
            wrapEl = E("div", {
                class: className
            });
            root[pos](wrapEl);
        }
        return wrapEl;
    }
    function copyElementToNewRoot(el, toRoot, options = {}) {
        var _a, _b;
        const {className: className = "GM-cloned", pos: pos = "appendChild"} = options;
        if (!el) {
            console.warn(`el is ${typeof el}`);
            return;
        }
        let elList = [];
        if (el instanceof HTMLElement) elList = [ el ]; else elList = el;
        null === (_b = null === (_a = toRoot.parentElement) || void 0 === _a ? void 0 : _a.querySelectorAll("." + className)) || void 0 === _b ? void 0 : _b.forEach((e => e.remove()));
        for (const _el of elList) {
            const clonedEl = _el.cloneNode(true);
            clonedEl.classList.add(className);
            toRoot[pos](clonedEl);
        }
    }
    function isFunction(x) {
        return "function" === typeof x;
    }
    function matchLocation(...patterns) {
        const s = document.location.href;
        for (const p of patterns) {
            if (isFunction(p) && p(s)) return true;
            if (RegExp(p).test(s)) return true;
        }
        return false;
    }
    function GM_addStyle(css) {
        const style = document.getElementById("GM_addStyleBy8626") || function() {
            const style = document.createElement("style");
            style.type = "text/css";
            style.id = "GM_addStyleBy8626";
            document.head.appendChild(style);
            return style;
        }();
        const sheet = style.sheet;
        null === sheet || void 0 === sheet ? void 0 : sheet.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
    }
    function isRegexp(value) {
        return "[object RegExp]" === toString.call(value);
    }
    function mRegExp(regExps) {
        return RegExp(regExps.map((function(r) {
            if (isRegexp(r)) return r.source;
            return r;
        })).join(""));
    }
    function round(n, parts = 2) {
        const i = Math.pow(10, parts);
        return Math.round(n * i) / i;
    }
    Object.keys;
    const entries = Object.entries;
    const values = Object.values;
    const WORD_BOUNDARY_END = /(?=\s|[.,);/]|$)/;
    const WEIGHT_REGEXP = mRegExp([ /(?<value>\d+[,.]\d+|\d+)/, /\s?/, "(?<unit>", "(?<weight_unit>(?<weight_SI>кг|килограмм(?:ов|а|))|г|грамм(?:ов|а|)|гр)", "|(?<volume_unit>(?<volume_SI>л|литр(?:ов|а|))|мл)", "|(?<length_unit>(?<length_SI>м|метр(?:ов|а|)))", ")", WORD_BOUNDARY_END ]);
    const QUANTITY_UNITS = [ "шт", "рулон", "пакет", "уп", "упаков(?:ок|ки|ка)", "салфет(?:ок|ки|ка)", "таб", "капсул" ];
    const QUANTITY_REGEXP = RegExp(`(?<quantity>\\d+)\\s?(?<quantity_unit>${QUANTITY_UNITS.join("|")})\\.?`);
    const QUANTITY_2_REGEXP = RegExp(`(?<quantity_2>\\d+)\\s?(?<quantity_2_unit>${QUANTITY_UNITS.join("|")})\\.?`);
    const COMBINE_DELIMETER_REGEXP = /\s?(?:[xх*×/]|по)\s?/;
    const COMBINE_QUANTITY_LIST = [ mRegExp([ /(?<quantity_2>\d+)/, COMBINE_DELIMETER_REGEXP, QUANTITY_REGEXP ]), mRegExp([ QUANTITY_REGEXP, COMBINE_DELIMETER_REGEXP, /(?<quantity_2>\d+)/ ]), mRegExp([ QUANTITY_2_REGEXP, COMBINE_DELIMETER_REGEXP, QUANTITY_REGEXP ]) ];
    const COMBINE_QANTITY_WEIGHT_REGEXP_LIST = [ mRegExp([ WEIGHT_REGEXP, COMBINE_DELIMETER_REGEXP, QUANTITY_REGEXP ]), mRegExp([ QUANTITY_REGEXP, COMBINE_DELIMETER_REGEXP, WEIGHT_REGEXP ]), mRegExp([ /(?<quantity>\d+)/, COMBINE_DELIMETER_REGEXP, WEIGHT_REGEXP ]), mRegExp([ WEIGHT_REGEXP, COMBINE_DELIMETER_REGEXP, /(?<quantity>\d+)/ ]) ];
    function parseGroups(groups) {
        const result = {
            weight: null,
            item_weight: null,
            weight_unit: null,
            quantity: 1
        };
        if (groups.value) {
            const valueStr = null === groups || void 0 === groups ? void 0 : groups.value;
            const unit = null === groups || void 0 === groups ? void 0 : groups.unit;
            if (valueStr && unit) {
                let value = parseFloat(valueStr.replace(",", "."));
                if (groups.weight_unit) {
                    if (!groups.weight_SI) value /= 1e3;
                    result.weight_unit = "кг";
                }
                if (groups.volume_unit) {
                    if (!groups.volume_SI) value /= 1e3;
                    result.weight_unit = "л";
                }
                if (groups.length_unit) {
                    if (!groups.length_SI) value /= 1e3;
                    result.weight_unit = "м";
                }
                result.weight = value;
                result.item_weight = value;
            }
        }
        if (groups.quantity) {
            const valueStr = null === groups || void 0 === groups ? void 0 : groups.quantity;
            if (valueStr) result.quantity = parseInt(valueStr);
        }
        if (result.item_weight && result.quantity > 1) result.weight = result.quantity * result.item_weight;
        return result;
    }
    function parseTitle(title) {
        var _a;
        for (const r of COMBINE_QANTITY_WEIGHT_REGEXP_LIST) {
            const rMatch = r.exec(title);
            if (rMatch) return parseGroups(rMatch.groups);
        }
        let groups = {};
        const weightMatch = WEIGHT_REGEXP.exec(title);
        if (null === weightMatch || void 0 === weightMatch ? void 0 : weightMatch.groups) groups = weightMatch.groups;
        let quantity = 0;
        for (const r of COMBINE_QUANTITY_LIST) {
            const rMatch = null === (_a = r.exec(title)) || void 0 === _a ? void 0 : _a.groups;
            if ((null === rMatch || void 0 === rMatch ? void 0 : rMatch.quantity) && (null === rMatch || void 0 === rMatch ? void 0 : rMatch.quantity_2)) {
                quantity = parseInt(rMatch.quantity) * parseInt(rMatch.quantity_2);
                break;
            }
        }
        if (quantity) groups.quantity = quantity.toString(); else {
            const quantityMatch = QUANTITY_REGEXP.exec(title);
            if (null === quantityMatch || void 0 === quantityMatch ? void 0 : quantityMatch.groups) groups = Object.assign(Object.assign({}, groups), quantityMatch.groups);
        }
        return parseGroups(groups);
    }
    function parseTitleWithPrice(title, price) {
        const res = Object.assign(Object.assign({}, parseTitle(title)), {
            weight_price: null,
            weight_price_display: null,
            quantity_price: null,
            quantity_price_display: null
        });
        if ((!res.quantity || 1 == res.quantity) && !res.weight) return null;
        if (res.weight) {
            res.weight_price = round(price / res.weight);
            res.weight_price_display = `${res.weight_price} ₽/${res.weight_unit || "?"}`;
        }
        if (res.quantity > 1) {
            res.quantity_price = round(price / res.quantity);
            res.quantity_price_display = `${res.quantity_price} ₽/шт`;
        }
        return res;
    }
    function renderBestPrice(titleInfo) {
        const wrapEl = document.createElement("div");
        wrapEl.className = "GM-best-price";
        if (!titleInfo) return wrapEl;
        if (titleInfo.weight_price_display) {
            const weightEl = document.createElement("p");
            weightEl.innerText = titleInfo.weight_price_display;
            wrapEl.appendChild(weightEl);
        }
        if (titleInfo.quantity_price_display) {
            const qtyEl = document.createElement("p");
            qtyEl.innerText = titleInfo.quantity_price_display;
            wrapEl.appendChild(qtyEl);
        }
        if (wrapEl.childNodes.length) {
            wrapEl.style.border = "1px solid red";
            wrapEl.style.padding = "5px";
            wrapEl.style.margin = "5px";
            wrapEl.style.width = "fit-content";
        }
        return wrapEl;
    }
    function byPropertiesOf(sortBy) {
        function compareByProperty(arg) {
            let key;
            let sortOrder = 1;
            if ("string" === typeof arg && arg.startsWith("-")) {
                sortOrder = -1;
                key = arg.substr(1);
            } else key = arg;
            return function(a, b) {
                const result = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
                return result * sortOrder;
            };
        }
        return function(obj1, obj2) {
            let i = 0;
            let result = 0;
            const numberOfProperties = null === sortBy || void 0 === sortBy ? void 0 : sortBy.length;
            while (0 === result && i < numberOfProperties) {
                result = compareByProperty(sortBy[i])(obj1, obj2);
                i++;
            }
            return result;
        };
    }
    function sort(arr, ...sortBy) {
        arr.sort(byPropertiesOf(sortBy));
    }
    const BEST_PRICE_WRAP_CLASS_NAME = "GM-best-price-wrap";
    const ORDER_NAME_LOCAL_STORAGE = "GM-best-price-default-order";
    const MAX_NUMBER = 99999999999;
    const BEST_ORDER_BUTTON_CLASS_NAME = "GM-best-price-button-wrap";
    GM_addStyle(`button.${BEST_ORDER_BUTTON_CLASS_NAME} {\nborder: 1px solid gray !important; padding: 5px !important; margin: 3px !important; }\n`);
    GM_addStyle(`button.${BEST_ORDER_BUTTON_CLASS_NAME}.active { border: 2px solid red !important; }`);
    function initReorderCatalog(catalogRoot, buttonRoot) {
        var _a;
        const buttonWrap = buttonRoot;
        if (!buttonWrap) return;
        const catalogRecords = [];
        let i = 0;
        for (const wrapEl of catalogRoot.querySelectorAll(":scope > *")) {
            const el = wrapEl.classList.contains(BEST_PRICE_WRAP_CLASS_NAME) ? wrapEl : wrapEl.querySelector("." + BEST_PRICE_WRAP_CLASS_NAME);
            if (!el) {
                console.warn("!", el);
                continue;
            }
            const ds = el.dataset;
            i += 1;
            let initial_order = parseInt(ds.initial_order || "0");
            if (!initial_order) {
                initial_order = i;
                ds.initial_order = i.toString();
            }
            catalogRecords.push({
                el: wrapEl,
                initial_order: initial_order,
                weight_price: ds.weight_price ? parseFloat(ds.weight_price) : MAX_NUMBER,
                quantity_price: ds.quantity_price ? parseFloat(ds.quantity_price) : MAX_NUMBER
            });
        }
        const buttons = {
            initial_order: E("button", {
                class: BEST_ORDER_BUTTON_CLASS_NAME
            }, "Reset"),
            weight_price: E("button", {
                class: BEST_ORDER_BUTTON_CLASS_NAME
            }, "by Weight"),
            quantity_price: E("button", {
                class: BEST_ORDER_BUTTON_CLASS_NAME
            }, "by Quantity")
        };
        function buttonClickHandler(orderState) {
            console.log(orderState);
            localStorage.setItem(ORDER_NAME_LOCAL_STORAGE, orderState);
            sort(catalogRecords, orderState);
            refreshCatalog();
            setActiveButton(buttons[orderState]);
        }
        for (const [k, b] of entries(buttons)) b.onclick = () => {
            buttonClickHandler(k);
        };
        const defaultOrder = localStorage.getItem(ORDER_NAME_LOCAL_STORAGE);
        if (defaultOrder) if ("initial_order" === defaultOrder) setActiveButton(buttons[defaultOrder]); else buttonClickHandler(defaultOrder);
        function refreshCatalog() {
            const wrap = catalogRoot;
            if (!wrap) return;
            const elements = document.createDocumentFragment();
            for (const c of catalogRecords) elements.appendChild(c.el);
            wrap.innerHTML = "";
            wrap.appendChild(elements);
        }
        function setActiveButton(button) {
            for (const b of values(buttons)) b.classList.remove("active");
            button.classList.add("active");
        }
        null === (_a = buttonWrap.querySelector("." + BEST_ORDER_BUTTON_CLASS_NAME)) || void 0 === _a ? void 0 : _a.remove();
        buttonWrap.appendChild(E("div", {
            class: BEST_ORDER_BUTTON_CLASS_NAME
        }, ...values(buttons)));
    }
    function getPriceFromElement(el) {
        var _a, _b;
        const priceText = null === (_b = null === (_a = null === el || void 0 === el ? void 0 : el.textContent) || void 0 === _a ? void 0 : _a.split("₽")[0]) || void 0 === _b ? void 0 : _b.trim();
        if (priceText) return parseFloat(priceText.replace("&thinsp;", "").replace(" ", "").replace(" ", "").replace(/\s/g, ""));
        return null;
    }
    function getPrice(sel) {
        const priceEl = document.querySelector(sel);
        return getPriceFromElement(priceEl);
    }
    function storeParsedTitleToElement(cardEl, parsedTitle) {
        cardEl.classList.add("GM-best-price-wrap");
        if (!parsedTitle) return;
        const ds = cardEl.dataset;
        for (const [k, v] of entries(parsedTitle)) ds[k] = (v || "").toString();
    }
    function initProductPage() {
        const init = () => {
            var _a, _b;
            const title = null === (_a = document.querySelector("[data-widget='webProductHeading']")) || void 0 === _a ? void 0 : _a.textContent;
            if (!title) return;
            let price = getPrice("[data-widget='webOzonAccountPrice']");
            if (!price) price = getPrice("[data-widget='webPrice']");
            if (price) {
                const parsedTitle = parseTitleWithPrice(title, price);
                null === (_b = document.querySelector("[data-widget='webPrice']")) || void 0 === _b ? void 0 : _b.appendChild(renderBestPrice(parsedTitle));
            }
        };
        waitCompletePage((() => {
            init();
        }));
    }
    function processProductCard(cardEl) {
        var _a;
        const wrapEl = getElementByXpath("a/following-sibling::div[1]", cardEl);
        if (!wrapEl || (null === wrapEl || void 0 === wrapEl ? void 0 : wrapEl.querySelector(".GM-best-price"))) return;
        const price = getPriceFromElement(wrapEl.querySelector("div"));
        const titleEl = wrapEl.querySelector("a span.tsBodyL, a span.tsBodyM:not([style])");
        const title = null === titleEl || void 0 === titleEl ? void 0 : titleEl.textContent;
        if (!title || !price) {
            storeParsedTitleToElement(cardEl, null);
            return;
        }
        console.log(title, price);
        const parsedTitle = parseTitleWithPrice(title, price);
        null === (_a = null === titleEl || void 0 === titleEl ? void 0 : titleEl.parentElement) || void 0 === _a ? void 0 : _a.insertBefore(renderBestPrice(parsedTitle), titleEl);
        storeParsedTitleToElement(cardEl, parsedTitle);
    }
    function initCatalog() {
        const init = () => {
            const catalogEl = document.querySelector(".widget-search-result-container > div");
            if (null === catalogEl || void 0 === catalogEl ? void 0 : catalogEl.querySelector("div.GM-best-price")) return;
            const cardList = document.querySelectorAll(".widget-search-result-container > div > div" + ",[data-widget='skuLine'] > div:nth-child(2) > div" + ",[data-widget='skuLine'] > div:nth-child(1) > div" + ",[data-widget='skuLineLR'] > div:nth-child(2) > div" + ",[data-widget='skuGrid'] > div:nth-child(2) > div" + ",[data-widget='skuShelfGoods'] > div:nth-child(2) > div > div > div > div");
            for (const cardEl of cardList) processProductCard(cardEl);
            const buttonWrapEl = document.querySelector('[data-widget="searchResultsSort"]');
            if (catalogEl) {
                buttonWrapEl && initReorderCatalog(catalogEl, buttonWrapEl);
                const paginator = document.querySelector('[data-widget="megaPaginator"] > div:nth-child(2)');
                const paginatorWrap = document.querySelector(".widget-search-result-container");
                if (null === paginator || void 0 === paginator ? void 0 : paginator.querySelector("a")) paginatorWrap && copyElementToNewRoot(paginator, paginatorWrap, {
                    pos: "before"
                });
            }
        };
        waitCompletePage((() => {
            init();
        }), {
            runOnce: false
        });
    }
    (function() {
        "use strict";
        if (!matchLocation("^https://(www\\.|)ozon\\.ru/.*")) return;
        console.log("OZON.ru");
        if (matchLocation("^https://(www\\.|)ozon\\.ru/product/.*")) initProductPage();
        if (matchLocation("^https://(www\\.|)ozon\\.ru/")) initCatalog();
        if (matchLocation("^https://(www\\.|)ozon\\.ru/(category|highlight|search|my|product|brand)/.*")) initCatalog();
    })();
    function lenta_com_initProductPage() {
        const init = () => {
            var _a, _b, _c;
            const title = null === (_b = null === (_a = document.querySelector(".sku-page__title")) || void 0 === _a ? void 0 : _a.textContent) || void 0 === _b ? void 0 : _b.trim();
            let price = getPrice(".sku-price--primary");
            if (!price || !title) return;
            price /= 100;
            console.log(title, price);
            const parsedTitle = parseTitleWithPrice(title, price);
            null === (_c = document.querySelector(".sku-prices-block")) || void 0 === _c ? void 0 : _c.after(renderBestPrice(parsedTitle));
        };
        waitCompletePage((() => {
            init();
        }));
    }
    function lenta_com_processProductCard(cardEl) {
        var _a, _b, _c;
        if (cardEl.classList.contains("GM-best-price-wrap")) return;
        let price = getPriceFromElement(cardEl.querySelector(".price-label--primary"));
        const title = null === (_b = null === (_a = cardEl.querySelector(".sku-card-small-header__title")) || void 0 === _a ? void 0 : _a.textContent) || void 0 === _b ? void 0 : _b.trim();
        if (!title || !price) {
            storeParsedTitleToElement(cardEl, null);
            return;
        }
        price /= 100;
        console.log(title, price);
        const parsedTitle = parseTitleWithPrice(title, price);
        null === (_c = cardEl.querySelector(".sku-card-small-prices ")) || void 0 === _c ? void 0 : _c.after(renderBestPrice(parsedTitle));
        storeParsedTitleToElement(cardEl, parsedTitle);
    }
    function lenta_com_initCatalog() {
        const init = () => {
            const cardList = document.querySelectorAll(".sku-card-small");
            for (const cardEl of cardList) lenta_com_processProductCard(cardEl);
            const catalogWrapEl = document.querySelector(".catalog-grid__grid");
            const buttonWrapEl = ElementGetOrCreate(document.querySelector(".catalog-sorting"), {
                pos: "before"
            });
            if (catalogWrapEl && buttonWrapEl) initReorderCatalog(catalogWrapEl, buttonWrapEl);
            const catalogEl = document.querySelector(".catalog-view__main");
            const paginationRootWrap = ElementGetOrCreate(catalogEl, {
                pos: "before",
                className: "GM-pagination-clone"
            });
            paginationRootWrap && copyElementToNewRoot(null === catalogEl || void 0 === catalogEl ? void 0 : catalogEl.querySelectorAll(".pagination"), paginationRootWrap);
            waitCompletePage((() => {
                init();
            }), {
                root: document.querySelector(".catalog-view__grid-container")
            });
        };
        waitCompletePage((() => {
            init();
        }));
    }
    (function() {
        "use strict";
        if (!matchLocation("^https://lenta\\.com/.*")) return;
        if (matchLocation("^https://lenta\\.com/product/.*")) lenta_com_initProductPage();
        if (matchLocation("^https://lenta\\.com/(catalog|search|brand)/.*")) lenta_com_initCatalog();
    })();
    function okeydostavka_ru_initProductPage() {
        const init = () => {
            var _a, _b, _c, _d;
            const productWrapEl = document.querySelector(".product_main_info");
            if (!productWrapEl) return;
            const title = null === (_b = null === (_a = null === productWrapEl || void 0 === productWrapEl ? void 0 : productWrapEl.querySelector("h1.main_header")) || void 0 === _a ? void 0 : _a.textContent) || void 0 === _b ? void 0 : _b.trim();
            const price = parseFloat((null === (_c = null === productWrapEl || void 0 === productWrapEl ? void 0 : productWrapEl.querySelector('.product-price > meta[itemprop="price"]')) || void 0 === _c ? void 0 : _c.content) || "");
            if (!price || !title) return;
            console.log(title, price);
            const parsedTitle = parseTitleWithPrice(title, price);
            null === (_d = null === productWrapEl || void 0 === productWrapEl ? void 0 : productWrapEl.querySelector(".product-price")) || void 0 === _d ? void 0 : _d.after(renderBestPrice(parsedTitle));
        };
        waitCompletePage((() => {
            init();
        }));
    }
    function okeydostavka_ru_processProductCard(cardEl) {
        var _a, _b;
        if (cardEl.classList.contains("GM-best-price-wrap")) return;
        const priceEl = null === cardEl || void 0 === cardEl ? void 0 : cardEl.querySelector(".price_and_cart .product-price");
        const price = getPriceFromElement(null === priceEl || void 0 === priceEl ? void 0 : priceEl.querySelector(":scope > span.price"));
        const title = null === (_b = null === (_a = cardEl.querySelector(".product-name a")) || void 0 === _a ? void 0 : _a.getAttribute("title")) || void 0 === _b ? void 0 : _b.trim();
        if (!title || !price) {
            storeParsedTitleToElement(cardEl, null);
            return;
        }
        console.log(title, price);
        const parsedTitle = parseTitleWithPrice(title, price);
        null === priceEl || void 0 === priceEl ? void 0 : priceEl.after(renderBestPrice(parsedTitle));
        storeParsedTitleToElement(cardEl, parsedTitle);
    }
    function okeydostavka_ru_initCatalog() {
        const init = () => {
            const cardList = document.querySelectorAll(".product_listing_container li" + ", .also-products  li > div.product" + ", .similar-products  li > div.product" + ", .catalogEntryRecommendationWidget  li > div.product");
            for (const cardEl of cardList) okeydostavka_ru_processProductCard(cardEl);
            const catalogWrapEl = document.querySelector(".product_listing_container > ul");
            const buttonWrapEl = ElementGetOrCreate(catalogWrapEl, {
                pos: "before"
            });
            if (catalogWrapEl && buttonWrapEl) initReorderCatalog(catalogWrapEl, buttonWrapEl);
            waitCompletePage((() => {
                init();
            }));
        };
        waitCompletePage((() => {
            init();
        }));
    }
    (function() {
        "use strict";
        if (!matchLocation("^https://(www\\.|)okeydostavka.ru/.*")) return;
        if (document.querySelector(".product_main_info")) okeydostavka_ru_initProductPage();
        okeydostavka_ru_initCatalog();
    })();
    function auchan_ru_initProductPage() {
        const init = () => {
            var _a, _b, _c;
            if (document.querySelector("main .GM-best-price")) return;
            const title = null === (_b = null === (_a = document.querySelector("main h1#productName")) || void 0 === _a ? void 0 : _a.textContent) || void 0 === _b ? void 0 : _b.trim();
            const price = getPrice("main .fullPricePDP");
            if (!price || !title) return;
            console.log(title, price);
            const parsedTitle = parseTitleWithPrice(title, price);
            null === (_c = document.querySelector("main .fullPricePDP")) || void 0 === _c ? void 0 : _c.after(renderBestPrice(parsedTitle));
        };
        init();
    }
    function auchan_ru_processProductCard(cardEl, priceSel, titleSel, renderPriceSel) {
        var _a, _b, _c;
        if (cardEl.classList.contains("GM-best-price-wrap")) return;
        const price = getPriceFromElement(cardEl.querySelector(priceSel));
        const title = null === (_b = null === (_a = cardEl.querySelector(titleSel)) || void 0 === _a ? void 0 : _a.textContent) || void 0 === _b ? void 0 : _b.trim();
        if (!title || !price) {
            storeParsedTitleToElement(cardEl, null);
            return;
        }
        console.log(title, price);
        const parsedTitle = parseTitleWithPrice(title, price);
        null === (_c = cardEl.querySelector(renderPriceSel)) || void 0 === _c ? void 0 : _c.after(renderBestPrice(parsedTitle));
        storeParsedTitleToElement(cardEl, parsedTitle);
    }
    function auchan_ru_initCatalog() {
        const init = () => {
            const cardList = document.querySelectorAll("article.productCard");
            for (const cardEl of cardList) auchan_ru_processProductCard(cardEl, ".productCardPriceData > div", ".linkToPDP", ".productCardPriceData ");
            const catalogWrapEl = getElementByXpath('//article[contains(@class,"productCard")]/ancestor::main//article/../..');
            if (!document.querySelector(".GM-wrap")) {
                const buttonWrapEl = ElementGetOrCreate(document.querySelector("#categoriesThirdLvlList"), {
                    pos: "after"
                });
                if (catalogWrapEl && buttonWrapEl) initReorderCatalog(catalogWrapEl, buttonWrapEl);
            }
            const catalogEl = document.querySelector(".catalog-view__main");
            const paginationRootWrap = ElementGetOrCreate(catalogEl, {
                pos: "before",
                className: "GM-pagination-clone"
            });
            paginationRootWrap && copyElementToNewRoot(null === catalogEl || void 0 === catalogEl ? void 0 : catalogEl.querySelectorAll(".pagination"), paginationRootWrap);
        };
        init();
    }
    function initSearchResults() {
        const cardList = document.querySelectorAll(".digi-product");
        for (const cardEl of cardList) auchan_ru_processProductCard(cardEl, ".digi-product-price-variant_actual", ".digi-product__label", ".price-and-cart");
        const catalogWrapEl = document.querySelector(".digi-products-grid");
        if (!document.querySelector(".digi-search .GM-wrap")) {
            const buttonWrapEl = ElementGetOrCreate(document.querySelector(".digi-main-results-actions"), {
                pos: "after"
            });
            if (catalogWrapEl && buttonWrapEl) initReorderCatalog(catalogWrapEl, buttonWrapEl);
        }
    }
    (function() {
        "use strict";
        if (!matchLocation("^https://(www\\.|)auchan\\.ru/.*")) return;
        waitCompletePage((() => {
            if (document.querySelector("#productName")) auchan_ru_initProductPage(); else if (document.querySelector(".digi-products")) initSearchResults(); else auchan_ru_initCatalog();
        }), {
            runOnce: false
        });
    })();
})();