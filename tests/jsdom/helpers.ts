import jsdomGlobal from 'jsdom-global';
import fs from 'fs';
import {ConstructorOptions} from 'jsdom';


type CleanUpCallback = () => void

interface PrepareJsDomOptions extends ConstructorOptions {
  path: string,
}

export function prepareJsdom(options: PrepareJsDomOptions): Promise<CleanUpCallback> {
  return new Promise((resolve) => {
    const {path, ...jsdom_options} = options
    const cleanup = jsdomGlobal(fs.readFileSync(path), jsdom_options);
    resolve(cleanup)
  })
}
