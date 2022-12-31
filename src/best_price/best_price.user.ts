// ==UserScript==
// @name         Best price helper for marketplace
// @namespace    http://tampermonkey.net/
// @description  Считаем стоимость за штуку/за кг/за л
// @author       Apkawa
// @license      MIT
// @icon         https://www.google.com/s2/favicons?domain=ozon.ru
// ==/UserScript==

import SITES from './sites';
import {buildPatternPrefixFromDomain, matchLocation} from '../utils/location';

(function () {
  for (const s of SITES) {
    const prefix = buildPatternPrefixFromDomain(s.domain);
    if (matchLocation(prefix + '/.*')) {
      console.log(s.domain);
      s.setup();
    }
  }
})();
