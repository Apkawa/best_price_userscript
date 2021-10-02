export function getElementByXpath(xpath: string, root: Node = document): Node | null {
  return document.evaluate(
    xpath, root,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null).singleNodeValue;
}

export function getElementsByXpath(xpath: string, root: Node = document): Node[] {
  const iterator = document.evaluate(
    xpath, root,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null);
  let result = []
  let el = iterator.iterateNext();
  while (el) {
    result.push(el)
    el = iterator.iterateNext();
  }
  return result
}

export function waitElement(match: (el: Node) => boolean, callback: () => void): () => void {
  let observer = new MutationObserver((mutations) => {
    let matchFlag = false
    mutations.forEach((mutation) => {
      if (!mutation.addedNodes) return
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        // do things to your newly added nodes here
        let node = mutation.addedNodes[i]
        matchFlag = match(node)
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
