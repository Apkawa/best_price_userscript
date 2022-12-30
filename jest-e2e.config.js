/** @type {import('ts-jest').JestConfigWithTsJest} */
// const ts_preset = require('ts-jest/jest-preset');
const preset = require('./jest.config');
module.exports = {
  ...preset,
  testEnvironment: './.jest/puppeteer/PuppeteerEnvironment.ts',
};
