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

export function waitElement(
  match: (el: HTMLElement) => boolean,
  callback: () => void,
  root: HTMLElement = document.body,
): () => void {
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
    observer.observe(root, {
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

export function waitCompletePage(callback: () => void, root: HTMLElement = document.body): void {
  let t: NodeJS.Timeout | null = null;
  const stop = waitElement(
    () => true,
    () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        stop();
        callback();
      }, 150);
    },
    root,
  );
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
