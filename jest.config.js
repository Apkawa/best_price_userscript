/** @type {import('ts-jest').JestConfigWithTsJest} */
// const ts_preset = require('ts-jest/jest-preset');
module.exports = {
  testEnvironment: 'node',
  preset: 'jest-puppeteer',
  testMatch: [ '**/?(*.)+(spec|test).[t]s' ],
  testPathIgnorePatterns: [
    '/node_modules/', 'dist',
  ],
  resetMocks: false,
  setupFiles: [
    "jest-localstorage-mock",
    require.resolve('./.jest/setupEnv.ts'),
  ],
  setupFilesAfterEnv: [
    require.resolve('./.jest/jest.setup.ts'),
  ],
  reporters: [
    require.resolve('./.jest/OutputConsoleOnFailureOnlyReporter.js'),
    require.resolve('./node_modules/@jest/reporters/build/SummaryReporter.js'),
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  globalSetup: require.resolve('jest-environment-puppeteer/setup'),
  globalTeardown: require.resolve('jest-environment-puppeteer/teardown'),
};
