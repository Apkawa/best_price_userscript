import {isFunction} from 'rxjs/internal-compatibility';

export function getElementByXpath(xpath: string, root: Node = document): HTMLElement | null {
  const e = document.evaluate(
    xpath,
    root,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  return e && (e as HTMLElement);
}

export function getElementsByXpath(xpath: string, root: Node = document): HTMLElement[] {
  const iterator = document.evaluate(
    xpath,
    root,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null,
  );
  const result: HTMLElement[] = [];
  let el = iterator.iterateNext();
  while (el) {
    result.push(el as HTMLElement);
    el = iterator.iterateNext();
  }
  return result;
}

export function markElementHandled(
  wrapFn: (el: HTMLElement) => void,
  attrName = '_handled',
): (el: HTMLElement) => void {
  return function (el) {
    if (el.getAttribute(attrName)) {
      return;
    }
    el.setAttribute(attrName, '1');
    wrapFn(el);
  };
}

export function waitElement(match: (el: HTMLElement) => boolean, callback: () => void): () => void {
  const observer = new MutationObserver((mutations) => {
    let matchFlag = false;
    mutations.forEach((mutation) => {
      if (!mutation.addedNodes) return;
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        // do things to your newly added nodes here
        const node = mutation.addedNodes[i];
        matchFlag = match(node as HTMLElement);
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
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: false,
    });
    isStarted = true;
  }

  function _stop() {
    observer.disconnect();
    isStarted = false;
  }

  _start();
  return () => {
    // stop watching using:
    _stop();
  };
}

export function E(
  tag: string,
  attributes: {[K: string]: string} = {},
  ...children: (Node | string)[]
): HTMLElement {
  const element = document.createElement(tag);
  for (const [k, v] of Object.entries(attributes)) {
    element.setAttribute(k, v);
  }
  const fragment = document.createDocumentFragment();
  children.forEach((child) => {
    if (typeof child === 'string') {
      child = document.createTextNode(child);
    }
    fragment.appendChild(child);
  });
  element.appendChild(fragment);
  return element;
}

type MatchPattern = string | RegExp | ((s: string) => boolean);

export function matchLocation(...patterns: MatchPattern[]): boolean {
  const s = document.location.href;
  for (const p of patterns) {
    if (isFunction(p) && p(s)) {
      return true;
    }
    if (RegExp(p as string).test(s)) {
      return true;
    }
  }
  return false;
}

type MapUrlType = {[K: string]: () => void};

/**
 * mapLocation({
 *   '^foo.bar/': () => { // some code },
 * })
 * @param map
 */
export function mapLocation(map: MapUrlType): void {
  const s = document.location.hostname + document.location.pathname;
  for (const [k, v] of Object.entries(map)) {
    if (RegExp(k).test(s)) {
      v();
    }
  }
}

export function parseSearch(): {[key: string]: string} {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

export default function isRegexp(value: unknown): value is RegExp {
  return toString.call(value) === '[object RegExp]';
}

export function mRegExp(regExps: (RegExp | string)[]): RegExp {
  return RegExp(
    regExps
      .map(function (r) {
        if (isRegexp(r)) {
          return r.source;
        }
        return r;
      })
      .join(''),
  );
}

export function GM_addStyle(css: string): void {
  const style =
    (document.getElementById('GM_addStyleBy8626') as HTMLStyleElement) ||
    (function (): HTMLStyleElement {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.id = 'GM_addStyleBy8626';
      document.head.appendChild(style);
      return style;
    })();
  const sheet = style.sheet;
  sheet?.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
}
