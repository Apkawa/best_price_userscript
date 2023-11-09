import fs from 'fs';
import path from 'node:path';

import puppeteer, {Page} from 'puppeteer';

import {autoScroll} from '../e2e/helpers';
import {JSDOM_SNAPSHOT_CONF, JSDOM_SNAPSHOT_FILE_ROOT, SiteConfType} from './jsdom_snapshot';
import {entries} from '../../src/utils';

async function preparePage(page: Page) {
  page.setDefaultTimeout(0);
  page.setDefaultNavigationTimeout(0);
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
  );

  //await page.setBypassCSP(true);
}

interface SavePageOptions {
  filepath: string,
  url: string,
  setup?: (page: Page) => Promise<void>,
  replace?: boolean
}


async function replaceAssetsUrlToAbsolute(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('img,script,link,style')
      .forEach(e => {
        let attrName = 'href';
        if (e.tagName == 'link') {
          attrName = 'src';
        }
        const href = e.getAttribute(attrName);
        if (href) {
          const u = new URL(href, document.location.origin);
          console.log(href, u.toString());
          e.setAttribute(attrName, u.toString());
        }
      });

  });
}

async function savePage(page: Page, options: SavePageOptions) {
  const {url, setup, filepath, replace = false} = options;
  if (!url) return;
  if (!replace && fs.existsSync(filepath)) {
    console.log("snapshot already exist. Skipped...");
    return;
  }
  await preparePage(page);
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });
  await autoScroll(page);
  if (setup) {
    await setup(page);
  }
  await replaceAssetsUrlToAbsolute(page);
  const bodyHTML = await page.evaluate(() => document.documentElement.outerHTML);
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
  fs.writeFileSync(filepath, bodyHTML);
}


(async () => {
  const browser = await puppeteer.launch({headless: false, devtools: false});

  for (const [site, pages] of entries(JSDOM_SNAPSHOT_CONF)) {
    for (const [page, conf] of entries(pages)) {
      const page_filepath = path.join(JSDOM_SNAPSHOT_FILE_ROOT, site, `${page}.html`);
      console.log(site, page, page_filepath, conf);
      const p = await browser.newPage();
      await savePage(p, {
        filepath: page_filepath,
        ...conf,
      });
      await p.close();
    }
  }

  await browser.close();
})();
