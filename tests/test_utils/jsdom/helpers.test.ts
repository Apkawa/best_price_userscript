import {describe, it} from 'node:test';
import {equal} from "node:assert"
import jsdom from 'jsdom';
import jsdomGlobal from 'jsdom-global';

describe("Test jsdom", () => {
  it("access document", () => {
    const dom = new jsdom.JSDOM('<!doctype html><html><body>test</body></html>');
    const doc = dom.window.document
    const win = doc.defaultView;
    if (win) {
      global['document'] = doc;
      global['window'] = win;
      global['HTMLElement'] = global['window'].HTMLElement;
    }

    const el = document.querySelector("body")
    equal(el?.innerHTML, "test")
  })

  it("jsdomGlobal check", () => {
    const cleanup = jsdomGlobal('<!doctype html><html><body>test</body></html>');
    const el = document.querySelector("body")
    equal(el?.innerHTML, "test")
    cleanup()
  })

})