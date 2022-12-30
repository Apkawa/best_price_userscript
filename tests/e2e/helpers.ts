/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */

import {Page, WaitForOptions} from 'puppeteer';


export async function prepareAndGoTo(page: Page, url: string, options?: WaitForOptions) {
  const defaultTimeout = Number(process.env.PUPPETEER_TIMEOUT || 10000);
  page.setDefaultTimeout(defaultTimeout);
  page.setDefaultNavigationTimeout(defaultTimeout);
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
  );

  await page.setBypassCSP(true);
  await page.goto(url, {...options});
  await page.addScriptTag({path: require.resolve(process.env.USERSCRIPT_PATH as string)});
}

interface ElementInfo extends Pick<Element, 'textContent' | 'outerHTML'> {
  // attributes: {[k: string]: string}
}


export async function waitForSelectorAndGetElementInfo(
  page: Page, sel: string): Promise<ElementInfo | null> {
  await page.waitForSelector(sel);
  const element = await page.$(sel);
  let value: ElementInfo | null = null;
  if (element) {
    value = await page.evaluate((el) => {
      if (el) {
        const r: ElementInfo = {
          textContent: el.textContent,
          outerHTML: el.outerHTML,
        };
        return r;
      }
      return null;
    }, element);

  }
  return Promise.resolve(value);
}

export async function waitForSelectorAndGetTextContent(
  page: Page, sel: string): Promise<string | null> {
  const el = await waitForSelectorAndGetElementInfo(page, sel);
  return Promise.resolve(el?.textContent || null);
}


export async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve(true);
        }
      }, 100);
    });
  });
}
