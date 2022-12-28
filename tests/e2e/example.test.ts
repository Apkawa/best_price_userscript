/**
 * @jest-environment jest-environment-puppeteer
 */
// Check test work
// https://pptr.dev/category/guides
describe('Google', () => {
  beforeAll(async () => {
    await page.goto('https://google.com')
  })
  it('should be titled "Google"', async () => {
    await expect(page.title()).resolves.toMatch('Google');
  })

  it('should display "google" text on page', async () => {
    const content = await page.content();
    expect(content).toMatch('google')
  })

})
