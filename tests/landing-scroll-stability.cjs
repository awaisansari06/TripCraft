const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 800 }, hasTouch: width === 390 });
      await page.goto(process.env.LANDING_URL || 'http://localhost:3112');
      await page.waitForFunction(() => document.querySelector('main')?.style.getPropertyValue('--scroll-progress') !== '');
      await page.evaluate(() => {
        window.reveals = new Map();
        window.replays = 0;
        window.movingReveals = 0;
        new MutationObserver(records => records.forEach(({ target }) => {
          if (!target.hasAttribute('data-revealing')) return;
          if (window.reveals.has(target)) window.replays++;
          window.reveals.set(target, true);
          if (!['none', '0px', '0px 0px'].includes(getComputedStyle(target).translate)) window.movingReveals++;
        })).observe(document.querySelector('main'), { subtree: true, attributes: true, attributeFilter: ['data-revealing'] });
      });
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 180) {
        await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
        await page.waitForTimeout(25);
      }
      await page.waitForTimeout(900);
      for (let y = height; y >= 0; y -= 360) {
        await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
        await page.waitForTimeout(25);
      }
      assert.ok(await page.evaluate(() => window.reveals.size) > 0, 'Entrance fades still run');
      assert.equal(await page.evaluate(() => window.replays), 0, 'Entrances never replay');
      assert.equal(await page.evaluate(() => window.movingReveals), 0, 'Reveals never move section content');
      await page.locator('#templates').scrollIntoViewIfNeeded();
      await page.reload();
      await page.waitForFunction(() => document.querySelector('main')?.style.getPropertyValue('--scroll-progress') !== '');
      assert.equal(await page.locator('#templates [data-revealing]').count(), 0, 'Restored visible content stays steady');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.locator('#destinations').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('[data-revealing]').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log('PASS', width, 'scroll, return scroll, refresh, reduced motion');
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
