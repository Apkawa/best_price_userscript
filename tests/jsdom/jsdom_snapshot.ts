import path from 'node:path';
import {Page} from 'puppeteer';
import fs from 'fs';

export const JSDOM_SNAPSHOT_FILE_ROOT = path.resolve(__dirname, './snapshots/');

export interface ConfType {
  url: string,
  setup: (page: Page) => Promise<void>
}

export const JSDOM_SNAPSHOT_CONF = {
  'ozon.ru': {
    catalog: {
      url: 'https://www.ozon.ru/category/korm-dlya-koshek-12348/',
    },
    page: {
      url: 'https://www.ozon.ru/product/' +
        'tabletki-dlya-posudomoechnyh-mashin-kix-becfosfatnye-30sht-701406601/'
    }
  },
  'perekrestok.ru': {
    catalog: {
      url: 'https://www.perekrestok.ru/cat/c/114/moloko',
    },
    page: {
      url: 'https://www.perekrestok.ru/cat/370/p/' +
        'moloko-pasterizovannoe-domik-v-derevne-2-5-1-4l-3467790',
    },
  },
  'lenta.com': {
    catalog: {
      url: 'https://lenta.com/catalog/bakaleya/sahar-sol/sahar/',
    },
    page: {
      url: 'https://lenta.com/product/sahar-rossiya-1kg-006128/',
    },
  },
  'wildberries.ru': {
    catalog: {
      url: 'https://www.wildberries.ru/catalog/pitanie/chay-kofe/kofe#c34640737',
    },
    page: {
      url: 'https://www.wildberries.ru/catalog/34640737/detail.aspx',
    },
    popup: {
      url: 'https://www.wildberries.ru/catalog/34640737/detail.aspx',
      setup: async (page: Page) => {
        await page.evaluate(() => window.scrollTo(0, 0));
        const el = await page.waitForSelector('.goods-card__preview-btn');
        await el?.evaluate(e => (e as HTMLButtonElement).click());
        await page.waitForSelector('.popup.j-product-popup.shown');
      },
    },
  },
  'okeydostavka.ru': {
    catalog: {
      url: 'https://www.okeydostavka.ru/spb/bakaleia-i-konservy/muka-smesi-dlia-vypechki-20',
    },
    page: {
      url: 'https://www.okeydostavka.ru/spb/' +
        'makaronnye-izdeliia-shebekinskie-babochki-vysshii-sort-',
    },
  },
  'example.com': {
    catalog: {
      url: '',
    },
    page: {
      url: '',
    },
  },
} as const;

export type SiteNameType = keyof typeof JSDOM_SNAPSHOT_CONF
export type PageNameType<K extends SiteNameType> = keyof typeof JSDOM_SNAPSHOT_CONF[K]
export type SiteConfType<K extends SiteNameType, P extends PageNameType<K>> = typeof JSDOM_SNAPSHOT_CONF[K][P]


export interface SnapshotResult {
  url: string,
  content: string,
}

export function getPageFilePath(site: string, page: string) {
  return path.join(JSDOM_SNAPSHOT_FILE_ROOT, site, `${page}.html`);
}

export const getSnapshot = <T extends typeof JSDOM_SNAPSHOT_CONF,
  SITE_NAME extends keyof T,
  PAGE extends keyof T[SITE_NAME]>(site: SITE_NAME, page: PAGE): SnapshotResult => {

  const {url} = (JSDOM_SNAPSHOT_CONF as T)[site][page] as ConfType;
  const filepath = getPageFilePath(site as string, page as string);
  const content = fs.readFileSync(filepath, 'utf-8');
  return {
    url,
    content,
  };
};



