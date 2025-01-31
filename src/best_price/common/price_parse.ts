export function parsePrice(text: string): number | null {
  const price = text.match(/\d+\s*[,.]\s*\d+/)?.[0];
  if (price) {
    return parseFloat(price);
  }
  return null;
}

export function getPriceFromElement(el: HTMLElement | null | undefined): number | null {
  let priceText = el?.textContent?.split('₽')[0]?.trim();
  if (priceText) {
    priceText = priceText
      .replace('&thinsp;', '')
      .replace(' ', '')
      .replace(' ', '')
      .replace(/\s/g, '');
    return parsePrice(priceText);
  }
  return null;
}

export function getPrice(sel: string, root: HTMLElement | null = document.body): number | null {
  const priceEl: HTMLElement | null = (root || document.body).querySelector(sel);
  return getPriceFromElement(priceEl);
}
