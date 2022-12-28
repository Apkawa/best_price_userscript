// No working
// import "expect-puppeteer";
import 'jest-expect-message';

const {PUPPETEER_TIMEOUT} = process.env;


// The Jest timeout is increased because these tests are a bit slow
jest.setTimeout(Number(PUPPETEER_TIMEOUT) || 100000);
