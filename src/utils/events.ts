/* eslint-disable */
type ElementNode = HTMLElement | Window | Document;

type FilterNotStartingWith<Set, Needle extends string> = Set extends `${Needle}${infer _X}`
  ? never
  : Set;
type FilterStartingWith<Set, Needle extends string> = Set extends `${Needle}${infer _X}`
  ? Set
  : never;

type EventHandler = Pick<GlobalEventHandlers, FilterStartingWith<keyof GlobalEventHandlers, 'on'>>;

type EventHandlerName = keyof EventHandler;

export interface EventListenersResult {
  node: ElementNode;
  type: keyof EventHandler;
  func: EventHandler[keyof EventHandler];
}

export function listAllEventListeners() {
  const allElements: ElementNode[] = [];
  document.querySelectorAll('*').forEach((e) => allElements.push(e));
  allElements.push(document);
  allElements.push(window);
  const types: EventHandlerName[] = [];

  for (const ev in window) {
    if (/^on/.test(ev)) types[types.length] = ev as EventHandlerName;
  }

  const elements: EventListenersResult[] = [];
  for (let i = 0; i < allElements.length; i++) {
    const currentElement = allElements[i];
    for (const t of types) {
      const cb = currentElement[t];
      if (typeof cb === 'function') {
        elements.push({
          node: currentElement,
          type: t,
          func: cb,
        });
      }
    }
  }

  return elements.sort(function (a, b) {
    return a.type.localeCompare(b.type);
  });
}
