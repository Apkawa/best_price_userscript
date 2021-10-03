import {isFunction} from "rxjs/internal-compatibility";

export function getElementByXpath(xpath: string, root: Node = document): HTMLElement | null {
  const e = document.evaluate(
    xpath, root,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null).singleNodeValue;
  return e && e as HTMLElement
}

export function getElementsByXpath(xpath: string, root: Node = document): HTMLElement[] {
  const iterator = document.evaluate(
    xpath, root,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null);
  let result: HTMLElement[] = []
  let el = iterator.iterateNext();
  while (el) {
    result.push(el as HTMLElement)
    el = iterator.iterateNext();
  }
  return result
}

export function waitElement(match: (el: HTMLElement) => boolean, callback: () => void): () => void {
  let observer = new MutationObserver((mutations) => {
    let matchFlag = false
    mutations.forEach((mutation) => {
      if (!mutation.addedNodes) return
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        // do things to your newly added nodes here
        let node = mutation.addedNodes[i]
        matchFlag = match(node as HTMLElement)
      }
    })
    if (matchFlag) {
      callback()
    }
  })

  observer.observe(document.body, {
    childList: true
    , subtree: true
    , attributes: false
    , characterData: false
  })

  return () => {
    // stop watching using:
    observer.disconnect()
  }
}

export function E(tag: string, attributes: { [K: string]: string } = {}, ...children: (Node | string)[]) {
  const element = document.createElement(tag)
  for (const attribute in attributes) {
    if (attributes.hasOwnProperty(attribute)) {
      element.setAttribute(attribute, attributes[attribute])
    }
  }
  const fragment = document.createDocumentFragment()
  children.forEach((child) => {
    if (typeof child === 'string') {
      child = document.createTextNode(child)
    }
    fragment.appendChild(child)
  })
  element.appendChild(fragment)
  return element
}

type MatchPattern = string | RegExp | ((s: string) => boolean)

export function matchLocation(...glob_patterns: MatchPattern[]): boolean {
  let s = document.location.href
  for (let p of glob_patterns) {
    if (isFunction(p) && p(s)) {
      return true
    }
    if (RegExp(p as string).test(s)) {
      return true
    }
  }
  return false
}

type MapUrlType = {[K: string]: () => void}

/**
 * mapLocation({
 *   '^https://foo.bar/': () => { // some code },
 * })
 * @param map
 */
export function mapLocation(map: MapUrlType): void {
  let s = document.location.href
  for (let [k, v] of Object.entries(map)) {
    if (RegExp(k).test(s)) {
      v()
    }
  }
}

export function parseSearch() {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries())
}
