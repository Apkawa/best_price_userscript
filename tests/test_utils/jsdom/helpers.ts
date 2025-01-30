import {ConfType, getPageFilePath, JSDOM_SNAPSHOT_CONF} from '../../jsdom/jsdom_snapshot';

import {ConstructorOptions} from 'jsdom';
import fs from 'fs';
import jsdomGlobal from 'jsdom-global';

jsdomGlobal();

export type CleanUpCallbackType = () => void


interface PrepareJsDomOptions extends ConstructorOptions {
  path: string,
}

export function prepareJsdom(options: PrepareJsDomOptions): Promise<CleanUpCallbackType> {
  return new Promise((resolve) => {
    const {path, ...jsdom_options} = options;
    const cleanup = jsdomGlobal(fs.readFileSync(path), jsdom_options);
    resolve(cleanup);
  });
}

export const prepareJsdomSnapshot = <T extends typeof JSDOM_SNAPSHOT_CONF,
  SITE_NAME extends keyof T,
  PAGE extends keyof T[SITE_NAME]>(site: SITE_NAME, page: PAGE, options?: ConstructorOptions,
): Promise<CleanUpCallbackType> => {
  return new Promise((resolve) => {
    // const snapshot = getSnapshot(site, name) // TODO победить типы
    const {url} = (JSDOM_SNAPSHOT_CONF as T)[site][page] as ConfType;
    const filepath = getPageFilePath(site as string, page as string);
    const content = fs.readFileSync(filepath, 'utf-8');
    const cleanup = jsdomGlobal(content, {url, ...options});
    resolve(cleanup);
  });
};