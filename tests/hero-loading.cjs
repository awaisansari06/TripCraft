const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  for (const theme of ['light', 'dark']) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme });
    await context.addInitScript(theme => {
      localStorage.setItem('theme', theme);
      window.heroSamples = [];
      const start = performance.now();
      function sample() {
        const heading = document.querySelector('main h1');
        if (heading) {
          const lines = [...heading.querySelectorAll(':scope > span')].map(el => el.getBoundingClientRect().top);
          window.heroSamples.push({ time: performance.now() - start, lines, opacity: getComputedStyle(heading).opacity });
        }
        if (performance.now() - start < 4500) requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    }, theme);
    const page = await context.newPage();
    // Late hydration must not replay the already-visible headline.
    await page.route('**/*.js*', async route => {
      await new Promise(resolve => setTimeout(resolve, 700));
      await route.continue();
    });
    await page.goto(process.env.LANDING_URL || 'http://localhost:3104', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4600);
    const samples = await page.evaluate(() => window.heroSamples);
    assert.ok(samples.length > 10);
    const gaps = samples.map(s => s.lines.slice(1).map((y, i) => y - s.lines[i]));
    for (let i = 0; i < 2; i++) assert.ok(Math.max(...gaps.map(g => g[i])) - Math.min(...gaps.map(g => g[i])) < 1, 'Headline lines must never stagger apart');
    assert.ok(samples.every(s => s.opacity === '1'), 'Heading must remain fully readable');
    assert.equal(await page.locator('main h1 [data-reveal]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `artifacts/hero-refinement/${theme}-${width}.png`, fullPage: true });
    results.push({ theme, width, sampledFrames: samples.length, stableHeadlineSpacing: true });
    await context.close();
  }
  fs.writeFileSync('artifacts/hero-refinement/loading-results.json', JSON.stringify(results, null, 2));
  console.log(results);
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
