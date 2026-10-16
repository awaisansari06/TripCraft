const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  for (const [width, theme] of [[1280, 'light'], [390, 'dark']]) {
    const page = await browser.newPage({ viewport: { width, height: 800 }, colorScheme: theme });
    await page.addInitScript(t => localStorage.setItem('theme', t), theme);
    await page.goto(process.env.APP_BASE_URL || 'http://localhost:3112');
    await page.waitForTimeout(1700);
    const heading = page.locator('#templates [data-reveal]').first();
    await heading.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
    await heading.evaluate(element => {
      window.replayCount = 0;
      new MutationObserver(records => { window.replayCount += records.filter(record => record.attributeName === 'data-revealing' && record.target.hasAttribute('data-revealing')).length; })
        .observe(element, { attributes: true, attributeFilter: ['data-revealing'] });
    });
    // Gradual exit, rather than a jump, reproduces the original missed boundary.
    for (let i = 0; i < 100; i++) {
      await page.evaluate(() => scrollBy({ top: 30, behavior: 'instant' }));
      await page.waitForTimeout(40);
      if ((await heading.boundingBox()).y < -300) break;
    }
    for (let i = 0; i < 100; i++) {
      await page.evaluate(() => scrollBy({ top: -30, behavior: 'instant' }));
      await page.waitForTimeout(40);
      if ((await heading.boundingBox()).y > 100) break;
    }
    await page.waitForTimeout(1000);
    assert.ok(await page.evaluate(() => window.replayCount) > 0, 'Gradual scroll-up must replay');
    const count = await page.evaluate(() => window.replayCount); await page.waitForTimeout(1000);
    assert.equal(await page.evaluate(() => window.replayCount), count, 'No boundary animation restart loop');
    assert.equal(await page.locator('[data-revealing]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.equal(await heading.evaluate(element => getComputedStyle(element).opacity), '1');
    await page.screenshot({ path: `artifacts/review-fixes/scroll-${theme}-${width}.png`, fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload(); await page.waitForTimeout(250);
    await heading.scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
    assert.equal(await page.locator('[data-revealing]').count(), 0);
    assert.equal(await heading.evaluate(element => getComputedStyle(element).opacity), '1');
    console.log('PASS', width, theme, 'gradual exit/re-entry, settled opacity, no replay loop, reduced motion');
    await page.close();
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
