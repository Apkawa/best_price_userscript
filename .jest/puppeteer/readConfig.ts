const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const cwd = require('cwd')
const merge = require('merge-deep')

const exists = promisify(fs.exists)

const DEFAULT_CONFIG = {
  launch: {},
  browser: 'chromium',
  browserContext: 'default',
  exitOnPageError: true,
}
const DEFAULT_CONFIG_CI = merge(DEFAULT_CONFIG, {
  launch: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  },
})

async function readConfig () {
  const defaultConfig =
    process.env.CI === 'true' ? DEFAULT_CONFIG_CI : DEFAULT_CONFIG

  const hasCustomConfigPath = !!process.env.JEST_PUPPETEER_CONFIG
  const configPath =
    process.env.JEST_PUPPETEER_CONFIG || 'jest-puppeteer.config.js'
  const absConfigPath = path.resolve(cwd(), configPath)
  const configExists = await exists(absConfigPath)

  if (hasCustomConfigPath && !configExists) {
    throw new Error(
      `Error: Can't find a root directory while resolving a config file path.\nProvided path to resolve: ${configPath}`,
    )
  }

  if (!hasCustomConfigPath && !configExists) {
    return defaultConfig
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const localConfig = await require(absConfigPath)
  return merge({}, defaultConfig, localConfig)
}

function getPuppeteer (config) {
  switch (config.browser.toLowerCase()) {
    /* eslint-disable global-require, import/no-dynamic-require, import/no-extraneous-dependencies, import/no-unresolved */
    case 'chromium':
      try {
        const puppeteer = require('puppeteer-extra')
        const StealthPlugin = require('puppeteer-extra-plugin-stealth')
        puppeteer.use(StealthPlugin())
        return puppeteer
      } catch (e) {
        return require('puppeteer-core')
      }
    case 'firefox':
      return require('puppeteer-firefox')
    /* eslint-enable */
    default:
      throw new Error(
        `Error: "browser" config option is given an unsupported value: ${browser}`,
      )
  }
}

module.exports = {
  readConfig: readConfig,
  getPuppeteer: getPuppeteer
}
