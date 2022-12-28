module.exports = {
  launch: {
    dumpio: true,
    headless: process.env.HEADLESS === 'true',
    args: ['--disable-infobars'],
  },
  browserContext: 'default',
};
