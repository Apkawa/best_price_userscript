/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */

import {Page} from 'patchright';

export interface WaitForOptions {
  /**
   * Referer header value. If provided it will take preference over the referer header value set by
   * [page.setExtraHTTPHeaders(headers)](https://playwright.dev/docs/api/class-page#page-set-extra-http-headers).
   */
  referer?: string;

  /**
   * Maximum operation time in milliseconds. Defaults to `0` - no timeout. The default value can be changed via
   * `navigationTimeout` option in the config, or by using the
   * [browserContext.setDefaultNavigationTimeout(timeout)](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-default-navigation-timeout),
   * [browserContext.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-default-timeout),
   * [page.setDefaultNavigationTimeout(timeout)](https://playwright.dev/docs/api/class-page#page-set-default-navigation-timeout)
   * or [page.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-page#page-set-default-timeout) methods.
   */
  timeout?: number;

  /**
   * When to consider operation succeeded, defaults to `load`. Events can be either:
   * - `'domcontentloaded'` - consider operation to be finished when the `DOMContentLoaded` event is fired.
   * - `'load'` - consider operation to be finished when the `load` event is fired.
   * - `'networkidle'` - **DISCOURAGED** consider operation to be finished when there are no network connections for
   *   at least `500` ms. Don't use this method for testing, rely on web assertions to assess readiness instead.
   * - `'commit'` - consider operation to be finished when network response is received and the document started
   *   loading.
   */
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
}


export async function prepareAndGoTo(page: Page, url: string, options?: WaitForOptions) {
  const defaultTimeout = Number(process.env.PUPPETEER_TIMEOUT || 10000);
  page.setDefaultTimeout(defaultTimeout);
  page.setDefaultNavigationTimeout(defaultTimeout);
  // await page.setUserAgent(
  //   'Mozilla/5.0 (X11; Linux x86_64) ' +
  //   'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
  // );
  //
  // await page.setBypassCSP(true);
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

export interface AutoScrollOptions {
  wait?: number,
  timeout?: number,
  maxHeight?: number,
  setup?: (page: Page) => Promise<void>,
}

export async function autoScroll(page: Page, options: AutoScrollOptions = {}) {
  await page.evaluate(async (options: AutoScrollOptions) => {
    const {wait = 100, timeout = 0, maxHeight = 0, setup} = options;
    if (setup) {
      await setup(page);
    }
    await new Promise((resolve) => {
      let totalHeight = 0;
      let totalTime = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        let stop = false;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          stop = true;
        }
        if (timeout && totalTime >= timeout) {
          stop = true;
        }
        if (maxHeight && totalHeight >= maxHeight) {
          stop = true;
        }
        if (stop) {
          clearInterval(timer);
          resolve(true);
        }
        totalTime += wait;
      }, wait);
    });
  }, options);
}
