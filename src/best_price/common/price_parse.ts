export function getPriceFromElement(el: HTMLElement | null | undefined): number | null {
  const priceText = el?.textContent?.split('₽')[0]?.trim();
  if (priceText) {
    return parseFloat(
      priceText.replace('&thinsp;', '').replace(' ', '').replace(' ', '').replace(/\s/g, ''),
    );
  }
  return null;
}

export function getPrice(sel: string, root: HTMLElement | null = document.body): number | null {
  const priceEl: HTMLElement | null = (root || document.body).querySelector(sel);
  return getPriceFromElement(priceEl);
}
