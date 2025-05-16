import fs from 'fs';
import path from 'node:path';
import {Page} from 'playwright';
import {AutoScrollOptions} from '../e2e/helpers';
import {WaitForNetworkIdleOptions} from './helpers';

export const JSDOM_SNAPSHOT_FILE_ROOT = path.resolve(__dirname, './snapshots/');

export interface ConfType {
  url: string;
  replace?: boolean;
  setup?: (page: Page) => Promise<void>;
  scrollOptions?: AutoScrollOptions;
  waitOptions?: WaitForNetworkIdleOptions;
}

export interface SnapshotConf {
  [site: string]: {
    [page: string]: ConfType;
  };
}

export const JSDOM_SNAPSHOT_CONF: SnapshotConf = {
  debug: {
    fingerprint: {
      url: 'https://fingerprint.com/products/bot-detection/',
    },
    sannysoft: {
      url: 'https://bot.sannysoft.com/',
    },
  },
  'ozon.ru': {
    catalog: {
      url: 'https://www.ozon.ru/category/korm-dlya-koshek-12348/',
      setup: async (page: Page) => {
        await page.waitForSelector('[data-widget="searchResultsSort"]');
      },
      waitOptions: {
        maxInflightRequests: 5,
      },
      scrollOptions: {
        timeout: 10 * 1000, // там бесконечный скролл с оценками, 10 секунд скроллим и хватит.
      },
    },
    page: {
      url: 'https://www.ozon.ru/product/153929230/?oos_search=false',
      scrollOptions: {
        timeout: 10 * 1000, // там бесконечный скролл с оценками, 10 секунд скроллим и хватит.
      },
    },
  },
  'perekrestok.ru': {
    catalog: {
      url: 'https://www.perekrestok.ru/cat/c/114/moloko',
    },
    page: {
      url:
        'https://www.perekrestok.ru/cat/370/p/' +
        'moloko-pasterizovannoe-domik-v-derevne-2-5-1-4l-3467790',
    },
  },
  'lenta.com': {
    catalog: {
      url: 'https://lenta.com/catalog/bakaleya/sahar-sol/sahar/',
      waitOptions: {
        maxInflightRequests: 5,
      },
      setup: async (page: Page) => {
        await page.waitForSelector('lu-product-card');
      },
    },
    page: {
      url: 'https://lenta.com/product/sahar-rossiya-1kg-006128/',
    },
  },
  'wildberries.ru': {
    catalog: {
      url: 'https://www.wildberries.ru/catalog/pitanie/chay-kofe/kofe#c34640737',
      waitOptions: {
        maxInflightRequests: 5,
      },
      setup: async (page: Page) => {
        await page.waitForSelector('.product-card__wrapper');
      },
    },
    page: {
      url: 'https://www.wildberries.ru/catalog/164419278/detail.aspx',
      waitOptions: {
        maxInflightRequests: 5,
      },
      setup: async (page: Page) => {
        await page.waitForSelector('.product-page__aside-container.j-price-block');
      },
    },
    popup: {
      url: 'https://www.wildberries.ru/catalog/34640737/detail.aspx',
      setup: async (page: Page) => {
        await page.waitForSelector('.cards-list__container .product-card');
        await page.evaluate(() => window.scrollTo(0, 0));
        const el = await page.waitForSelector('.product-card__fast-view');
        await el?.evaluate((e) => (e as HTMLButtonElement).click());
        await page.waitForSelector('.popup.j-product-popup.shown');
      },
    },
  },
  'okeydostavka.ru': {
    catalog: {
      url: 'https://www.okeydostavka.ru/spb/bakaleia-i-konservy/muka-smesi-dlia-vypechki-20',
      waitOptions: {
        timeout: 0,
        maxInflightRequests: 2,
        waitForLastRequest: 500,
      },
    },
    page: {
      url:
        'https://www.okeydostavka.ru/spb/' +
        'makaronnye-izdeliia-shebekinskie-babochki-vysshii-sort-',
      waitOptions: {
        timeout: 60 * 1000,
        maxInflightRequests: 0,
        waitForLastRequest: 500,
      },
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

export type SiteNameType = keyof typeof JSDOM_SNAPSHOT_CONF;
export type PageNameType<K extends SiteNameType> = keyof (typeof JSDOM_SNAPSHOT_CONF)[K];
export type SiteConfType<
  K extends SiteNameType,
  P extends PageNameType<K>,
> = (typeof JSDOM_SNAPSHOT_CONF)[K][P];

export interface SnapshotResult {
  url: string;
  content: string;
}

export function getPageFilePath(site: string, page: string) {
  return path.join(JSDOM_SNAPSHOT_FILE_ROOT, site, `${page}.html`);
}

export const getSnapshot = <
  T extends typeof JSDOM_SNAPSHOT_CONF,
  SITE_NAME extends keyof T,
  PAGE extends keyof T[SITE_NAME],
>(
  site: SITE_NAME,
  page: PAGE,
): SnapshotResult => {
  const {url} = (JSDOM_SNAPSHOT_CONF as T)[site][page] as ConfType;
  const filepath = getPageFilePath(site as string, page as string);
  const content = fs.readFileSync(filepath, 'utf-8');
  return {
    url,
    content,
  };
};
