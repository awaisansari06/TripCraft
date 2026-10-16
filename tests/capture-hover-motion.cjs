const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/muham/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1600); // wait for initial splash to clear

  // 1. Hover on first template card
  const templateCard = page.locator('#templates [data-depth]').first();
  await templateCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await templateCard.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'artifacts/hover-template-card.png' });
  console.log('Captured hover on template card');

  // 2. Hover on hero prompt button
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
  const submitBtn = page.locator('form button[type="submit"]');
  await submitBtn.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'artifacts/hover-submit-button.png' });
  console.log('Captured hover on submit button');

  await browser.close();
  console.log('Done capturing hover motion!');
})().catch(e => { console.error(e); process.exit(1); });
