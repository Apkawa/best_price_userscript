import jsdomGlobal from 'jsdom-global';
import fs from 'fs';
import {ConstructorOptions} from 'jsdom';
import {ConfType, getPageFilePath, JSDOM_SNAPSHOT_CONF} from './jsdom_snapshot';
import puppeteer, {Page} from 'puppeteer';
import {promises} from 'dns';


export type CleanUpCallback = () => void

interface PrepareJsDomOptions extends ConstructorOptions {
  path: string,
}

export function prepareJsdom(options: PrepareJsDomOptions): Promise<CleanUpCallback> {
  return new Promise((resolve) => {
    const {path, ...jsdom_options} = options;
    const cleanup = jsdomGlobal(fs.readFileSync(path), jsdom_options);
    resolve(cleanup);
  });
}

export const prepareJsdomSnapshot = <T extends typeof JSDOM_SNAPSHOT_CONF,
  SITE_NAME extends keyof T,
  PAGE extends keyof T[SITE_NAME]>(site: SITE_NAME, page: PAGE, options?: ConstructorOptions,
): Promise<CleanUpCallback> => {
  return new Promise((resolve) => {
    // const snapshot = getSnapshot(site, name) // TODO победить типы
    const {url} = (JSDOM_SNAPSHOT_CONF as T)[site][page] as ConfType;
    const filepath = getPageFilePath(site as string, page as string);
    const content = fs.readFileSync(filepath, 'utf-8');
    const cleanup = jsdomGlobal(content, {url, ...options});
    resolve(cleanup);
  });
};

export async function displayHtmlInBrowser(html: string | Document): Promise<Page> {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  //monitor requests
  await page.setRequestInterception(true);
  //check resourceType is script
  page.on('request', async (request): Promise<void> => {
    if (request.resourceType() === 'script') {
      await request.abort();
    } else {
      await request.continue();
    }

  });
  let _html;
  if (typeof html === 'string') {
    _html = html;
    await page.setContent(html);
  } else {
    _html = html.documentElement.outerHTML;
  }
  await page.setContent(_html, {waitUntil: 'networkidle0'});
  return Promise.resolve(page);
}


export interface WaitForNetworkIdleOptions {
  timeout?: number,
  waitForFirstRequest?: number,
  waitForLastRequest?: number,
  maxInflightRequests?: number,
}

export function waitForNetworkIdle(page: Page, options: WaitForNetworkIdleOptions = {}) {
  const {
    timeout = 30000,
    waitForFirstRequest = 1000,
    waitForLastRequest = 200,
  } = options;
  const maxInflightRequests = Math.max(options?.maxInflightRequests || 0, 0);

  let inflight = 0;
  let resolve: (value: void) => void;
  let reject: (reason?: any) => void;
  let lastRequestTimeoutId: NodeJS.Timeout;

  function cleanup() {
    clearTimeout(timeoutId);
    clearTimeout(firstRequestTimeoutId);
    clearTimeout(lastRequestTimeoutId);
    /* eslint-disable no-use-before-define */
    page.off('request', onRequestStarted);
    page.off('requestfinished', onRequestFinished);
    page.off('requestfailed', onRequestFinished);
    /* eslint-enable no-use-before-define */
  }

  function check() {
    if (inflight <= maxInflightRequests) {
      clearTimeout(lastRequestTimeoutId);
      lastRequestTimeoutId = setTimeout(onLastRequestTimeout, waitForLastRequest);
    }
  }

  function onRequestStarted() {
    clearTimeout(firstRequestTimeoutId);
    clearTimeout(lastRequestTimeoutId);
    inflight += 1;
  }

  function onRequestFinished() {
    inflight -= 1;
    check();
  }

  function onTimeout() {
    cleanup();
    reject(new Error('Timeout'));
  }

  function onFirstRequestTimeout() {
    cleanup();
    resolve();
  }

  function onLastRequestTimeout() {
    cleanup();
    resolve();
  }

  page.on('request', onRequestStarted);
  page.on('requestfinished', onRequestFinished);
  page.on('requestfailed', onRequestFinished);

  const timeoutId = setTimeout(onTimeout, timeout); // Overall page timeout
  const firstRequestTimeoutId = setTimeout(onFirstRequestTimeout, waitForFirstRequest);

  return new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
}