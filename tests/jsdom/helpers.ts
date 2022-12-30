import jsdomGlobal from 'jsdom-global';
import fs from 'fs';
import {ConstructorOptions} from 'jsdom';
import {ConfType, getPageFilePath, JSDOM_SNAPSHOT_CONF} from './jsdom_snapshot';
import puppeteer, {Page} from 'puppeteer';


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
