import {after, before} from 'node:test';
import {ConstructorOptions} from 'jsdom';
import jsdomGlobal from 'jsdom-global';

export function jsdomGlobalHook(html?: string | Buffer, options?: ConstructorOptions): void {
  let cleanup: () => void;
  before(() => {
    cleanup = jsdomGlobal(html, options);
  });
  after(() => {
    cleanup();
  });
}

jsdomGlobalHook();
