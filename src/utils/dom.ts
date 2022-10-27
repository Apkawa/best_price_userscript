import {Optional} from '@app/utils/types';

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

export type StopCallback = () => void;

export function waitElement(
  match: (el: HTMLElement) => boolean,
  callback: () => void,
  root: Optional<HTMLElement> = document.body,
): StopCallback {
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
    observer.observe(root || document.body, {
      childList: true,
      subtree: true,
      attributes: false,
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

export interface WaitCompletePageOptions {
  root?: Optional<HTMLElement>;
  runOnce?: boolean;
  sync?: boolean;
}

export function waitCompletePage(
  callback: () => void,
  options: WaitCompletePageOptions = {},
): StopCallback {
  const {root = document.body, runOnce = true, sync = true} = options;
  let t: NodeJS.Timeout | null = null;

  let lock = false;
  const run = (): StopCallback => {
    const stop = waitElement(
      () => true,
      () => {
        if (t) clearTimeout(t);
        t = setTimeout(() => {
          if (lock) return;
          lock = true;
          if (runOnce || sync) {
            stop();
          }
          callback();
          if (sync && !runOnce) {
            setTimeout(run, 100);
          }
          lock = false;
        }, 150);
      },
      root,
    );
    return stop;
  };

  return run();
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

export interface ElementGetOrCreateOptions {
  className?: string;
  pos?: 'before' | 'after' | 'appendChild';
}

export function ElementGetOrCreate(
  root: Optional<HTMLElement>,
  options: ElementGetOrCreateOptions = {},
): HTMLElement | null {
  const {className = 'GM-wrap', pos = 'appendChild'} = options;
  if (!root) return null;
  let wrapEl = root.parentElement?.querySelector<HTMLElement>('.' + className);
  if (!wrapEl) {
    wrapEl = E('div', {class: className});
    root[pos](wrapEl);
  }
  return wrapEl;
}

export interface copyElementToNewRootOptions {
  className?: string;
  pos?: 'before' | 'after' | 'appendChild';
}

export function copyElementToNewRoot(
  el: Optional<HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>>,
  toRoot: HTMLElement,
  options: copyElementToNewRootOptions = {},
): void {
  const {className = 'GM-cloned', pos = 'appendChild'} = options;
  if (!el) {
    console.warn(`el is ${typeof el}`);
    return;
  }

  let elList: HTMLElement[] | NodeListOf<HTMLElement> = [];
  if (el instanceof HTMLElement) {
    elList = [el];
  } else {
    elList = el;
  }
  toRoot.parentElement?.querySelectorAll('.' + className)?.forEach((e) => e.remove());

  for (const _el of elList) {
    const clonedEl = _el.cloneNode(true) as HTMLElement;
    clonedEl.classList.add(className);
    toRoot[pos](clonedEl);
  }
}

// export function cloneNode(el: HTMLElement, deep: boolean, copyEvent: boolean): HTMLElement {
//   if (!copyEvent) {
//     return el.cloneNode(deep) as HTMLElement
//   }
//   const clonedNode = el.cloneNode(false)
//   const events = ''
//
//   return el
// }
