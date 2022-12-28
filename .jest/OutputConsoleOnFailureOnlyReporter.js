const { DefaultReporter } = require('@jest/reporters')
const chalk = require('chalk')


const TITLE_BULLET = chalk.bold('\u25cf ');

/** A custom Jest reporter that skips console output for passing tests. */
class OutputConsoleOnFailureOnlyReporter extends DefaultReporter {
  constructor() {
    super(...arguments);
  }

  logWithoutConsole(message) {
    // If the message looks like captured console logging from here:
    // https://github.com/facebook/jest/blob/c660c1688d4a1898ba00143abad22ad2785f350b/packages/jest-reporters/src/DefaultReporter.ts#L223
    // then skip it.
    if (message.startsWith(`  ${TITLE_BULLET}Console`)) {
      return;
    }
    process.stderr.write(`${message}\n`);
  }

  printTestFileHeader(_testPath, config, result) {
    const originalLog = this.log;
    // If the test didn't fail, then don't log its console output.
    if (result.numFailingTests === 0 && !result.testExecError) {
      this.log = this.logWithoutConsole;
    }
    super.printTestFileHeader(...arguments);
    // Restore the original method.
    this.log = originalLog;
  }
}

module.exports = OutputConsoleOnFailureOnlyReporter
