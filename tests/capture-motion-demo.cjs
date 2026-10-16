const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/muham/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // Navigate with domcontentloaded so we capture the splash during its active display
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'artifacts/loading-splash.png' });
  console.log('Captured splash at 250ms');

  // Wait for splash to dissolve smoothly
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'artifacts/loading-settled.png' });
  console.log('Captured settled view after dissolve');

  // Scroll down smoothly
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'smooth' }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'artifacts/scrolling-down.png' });
  console.log('Captured scrolling down at 900px');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
