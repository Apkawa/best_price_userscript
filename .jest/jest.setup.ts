// No working
// import "expect-puppeteer";
import 'jest-expect-message';
import jsdomGlobal from 'jsdom-global'
// // Костыль для jsdom
// import { TextEncoder, TextDecoder } from 'util'
// global.TextEncoder = TextEncoder
// // @ts-ignore
// global.TextDecoder = TextDecoder

jsdomGlobal()


const {PUPPETEER_TIMEOUT} = process.env;


// The Jest timeout is increased because these tests are a bit slow
jest.setTimeout(Number(PUPPETEER_TIMEOUT) || 100000);
