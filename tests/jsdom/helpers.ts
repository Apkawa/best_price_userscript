import {chromium, Page} from 'playwright';


export async function displayHtmlInBrowser(html: string | Document | undefined = undefined): Promise<Page> {
  // TODO reuse browser
  const browser = await chromium.launch({
    headless: false,
    devtools: false,
  });
  const page = await browser.newPage();
  // disable scripts on page
  await page.route('**/*', route => {
    route.request().resourceType() === 'script' ? route.abort() : route.continue();
  });
  let _html;
  if (typeof html === 'string') {
    _html = html;
    await page.setContent(html);
  } else {
    if (!html) {
      html = document;
    }
    _html = html.documentElement.outerHTML;
  }
  await page.setContent(_html, {waitUntil: 'networkidle'});
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
  let timeoutId: NodeJS.Timeout | null;

  function cleanup() {
    timeoutId && clearTimeout(timeoutId);
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

  if (timeout) {
    timeoutId = setTimeout(onTimeout, timeout); // Overall page timeout
  }

  const firstRequestTimeoutId = setTimeout(onFirstRequestTimeout, waitForFirstRequest);

  return new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
}