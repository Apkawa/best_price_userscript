import fs from 'fs';
import path from 'node:path';

// обходим проверки на ботов
import {chromium, Page} from 'playwright';

import {autoScroll} from '../e2e/helpers';
import {ConfType, JSDOM_SNAPSHOT_CONF, JSDOM_SNAPSHOT_FILE_ROOT} from './jsdom_snapshot';
import {entries} from '../../src/utils';
import {waitForNetworkIdle} from './helpers';

async function preparePage(page: Page) {
  page.setDefaultTimeout(0);
  page.setDefaultNavigationTimeout(0);
  await page.setViewportSize({
    width: 1920,
    height: 1080,
  });

  // await page.setBypassCSP(true);
}

interface SavePageOptions extends ConfType {
  filepath: string,
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
  const {url, setup, filepath, scrollOptions = {}} = options;
  await preparePage(page);
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  });
  await waitForNetworkIdle(page, options.waitOptions);
  // TODO  проверка CF
  await autoScroll(page, scrollOptions);
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
  const browser = await chromium.launch({headless: false})

  for (const [site, pages] of entries(JSDOM_SNAPSHOT_CONF)) {
    for (const [page, conf] of entries(pages)) {
      const page_filepath = path.join(JSDOM_SNAPSHOT_FILE_ROOT, site, `${page}.html`);
      const options: SavePageOptions = {
        filepath: page_filepath,
        ...conf,
      };
      console.log(site, page, options);
      if (!options.url) continue;
      if (!options.replace && fs.existsSync(options.filepath)) {
        console.log('snapshot already exist. Skipped...');
        continue;
      }
      const p = await browser.newPage();
      await savePage(p, options);
      await p.close();

    }
  }

  await browser.close();
})();
