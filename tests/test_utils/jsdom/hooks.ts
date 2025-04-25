import {afterEach, beforeEach} from 'node:test';
import jsdomGlobal from 'jsdom-global';
import {ConstructorOptions} from 'jsdom';
import {CleanUpCallbackType, prepareJsdomSnapshot} from '@tests/test_utils/jsdom/helpers';
import {JSDOM_SNAPSHOT_CONF} from '@tests/jsdom/jsdom_snapshot';

export function jsdomHook(html?: string | Buffer, options?: ConstructorOptions): void {
  let cleanup: () => void;
  beforeEach(() => {
    cleanup = jsdomGlobal(html, options);
  });
  afterEach(() => {
    cleanup();
  });
}


export function prepareJsdomSnapshotHook<T extends typeof JSDOM_SNAPSHOT_CONF,
  SITE_NAME extends keyof T,
  PAGE extends keyof T[SITE_NAME]>(site: SITE_NAME, page: PAGE, options?: ConstructorOptions,
): void {

  let cleanup: CleanUpCallbackType;
  beforeEach(async () => {
    cleanup = await prepareJsdomSnapshot(site as string, page as string, options);
    global.MutationObserver = window.MutationObserver
    global.MutationRecord = window.MutationRecord
  });
  afterEach(() => {
    cleanup();
  });
}