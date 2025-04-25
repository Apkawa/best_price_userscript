import {after, before} from 'node:test';
import jsdomGlobal from 'jsdom-global';
import {ConstructorOptions} from 'jsdom';


export function jsdomGlobalHook(html?: string | Buffer, options?: ConstructorOptions): void {
  let cleanup: () => void;
  before(() => {
    cleanup = jsdomGlobal(html, options);
  });
  after(() => {
    cleanup();
  });
}

jsdomGlobalHook()
