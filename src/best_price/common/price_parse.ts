export function parsePrice(text: string): number | null {
  text = text.split('₽')[0]?.trim();
  if (!text) {
    return null;
  }
  text = text.replace('&thinsp;', '').replace(' ', '').replace(' ', '').replace(/\s/g, '');
  const price = text.match(/\d+(\s*[,.]\s*\d+)?/)?.[0].trim();
  if (price) {
    return parseFloat(price);
  }
  return null;
}

export function getPriceFromElement(el: HTMLElement | null | undefined): number | null {
  const priceText = el?.textContent?.trim();
  if (priceText) {
    return parsePrice(priceText);
  }
  return null;
}

export function getPrice(sel: string, root: HTMLElement | null = document.body): number | null {
  const priceEl: HTMLElement | null = (root || document.body).querySelector(sel);
  return getPriceFromElement(priceEl);
}
