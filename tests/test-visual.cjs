const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/muham/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'artifacts/current-home.png' });
  await browser.close();
  console.log('Screenshot captured to artifacts/current-home.png');
})().catch(e => { console.error(e); process.exit(1); });
