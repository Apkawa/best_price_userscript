import fs from 'fs';
import path from 'node:path';

import UserAgent from 'user-agents';
import {Page, executablePath} from 'puppeteer';
import puppeteer from 'puppeteer-extra';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-call
puppeteer.use(AdblockerPlugin({blockTrackers: true}));
puppeteer.use(StealthPlugin());

import {autoScroll} from '../e2e/helpers';
import {JSDOM_SNAPSHOT_CONF, JSDOM_SNAPSHOT_FILE_ROOT, SiteConfType} from './jsdom_snapshot';
import {entries} from '../../src/utils';
import {doc} from 'prettier';


async function preparePage(page: Page) {
  page.setDefaultTimeout(0);
  page.setDefaultNavigationTimeout(0);
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  const ua = (new UserAgent()).random().toString();
  await page.setUserAgent(ua);

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
    return;
  }
  await preparePage(page);
  const response = await page.goto(url, {
    waitUntil: 'networkidle0',
  });
  const headers = response?.headers();
  const status = response?.status();
  if (status !== 200) {
    console.error('status != 200', url, headers);
    return;
  }
  await autoScroll(page);
  if (setup) {
    await setup(page);
  }
  await replaceAssetsUrlToAbsolute(page);
  // drop script, inlined svg and data-*
  await page.evaluate(() => {
    document.querySelectorAll('svg,script').forEach(e => e.remove());
    document.querySelectorAll('div').forEach(e => {
      for (const k of Object.keys(e?.dataset)) {
        delete e.dataset[k];
      }
    });
    // Clean nested anchor links, forbidden for html
    document.querySelectorAll('a a').forEach(e => e.remove());
  });
  // workaround for styled-components
  await page.evaluate(() => {

    const styleEls: HTMLStyleElement[] = [];
    for (const sheet of document.styleSheets) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('type', sheet.type);
      styleEl.setAttribute('media', sheet.media.toString());
      let cssText = '';
      for (const cssRule of sheet.cssRules) {
        cssText += cssRule.cssText;
      }
      styleEl.innerHTML = cssText;
      styleEls.push(styleEl);
    }
    styleEls.forEach((e) => document.head.appendChild(e));

  });
  const bodyHTML = await page.evaluate(() => document.documentElement.outerHTML);
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
  fs.writeFileSync(filepath, bodyHTML);
}


(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    executablePath: executablePath(),
  });

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
