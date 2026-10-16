const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  await page.goto(process.env.LANDING_URL || 'http://localhost:3105');
  const suggestion = page.locator('.tc-typewriter > span');
  await page.waitForFunction(() => document.querySelector('.tc-typewriter > span')?.textContent?.startsWith('Honeymoon'));
  await page.waitForFunction(() => {
    const text = document.querySelector('.tc-typewriter > span')?.textContent;
    return text && !text.startsWith('Honeymoon in Bali for 7 days...');
  });
  const input = page.getByRole('textbox', { name: 'Describe your dream trip' });
  await input.fill('A weekend in Rome');
  assert.equal(await page.locator('.tc-typewriter').count(), 0);
  await input.blur();
  assert.equal(await input.inputValue(), 'A weekend in Rome');
  await input.fill('');
  await input.blur();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  const text = await suggestion.textContent();
  await page.waitForTimeout(2200);
  assert.equal(await suggestion.textContent(), text);
  assert.equal(await page.locator('.tc-typewriter i').count(), 0);
  await browser.close();
  console.log('Rotating suggestions, focus pause, preserved user input and reduced motion passed.');
})().catch(error => { console.error(error); process.exit(1); });
