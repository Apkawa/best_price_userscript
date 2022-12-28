module.exports = {
  launch: {
    dumpio: true,
    headless: process.env.HEADLESS !== 'false',
    args: [
      '--disable-infobars',
      '--disable-web-security',
    ],
  },
  browserContext: 'default',
};
