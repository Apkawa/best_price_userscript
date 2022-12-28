/** @type {import('ts-jest').JestConfigWithTsJest} */
// const ts_preset = require('ts-jest/jest-preset');
module.exports = {
  testEnvironment: 'jsdom',
  preset: 'jest-puppeteer',
  testMatch: [ '**/?(*.)+(spec|test).[t]s' ],
  testPathIgnorePatterns: [
    '/node_modules/', 'dist',
  ],
  setupFiles: [
    require.resolve('./.jest/setupEnv.ts'),
  ],
  setupFilesAfterEnv: [
    require.resolve('./.jest/jest.setup.ts'),
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  globalSetup: require.resolve('jest-environment-puppeteer/setup'),
  globalTeardown: require.resolve('jest-environment-puppeteer/teardown'),
};
