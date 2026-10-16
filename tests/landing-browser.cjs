const BASE_URL = process.env.LANDING_URL || 'http://localhost:3102';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ colorScheme: theme, reducedMotion: 'reduce' });
    await context.addInitScript(theme => !localStorage.getItem('theme') && localStorage.setItem('theme', theme), theme);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    for (const width of [1440, 1280, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('[data-revealed="true"]'));
      // Load every reserved image before the full-page capture.
      await page.locator('main img').evaluateAll(images => images.forEach(image => image.loading = 'eager'));
      await page.waitForFunction(() => Array.from(document.querySelectorAll('main img')).every(image => image.complete && image.naturalWidth > 0));
      await page.locator('main img').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
      const state = await page.evaluate(() => {
        const grid = document.querySelector('#destinations > div:last-child');
        const cards = Array.from(grid.children).map(card => {
          const bounds = card.getBoundingClientRect();
          return { label: card.textContent.trim(), width: bounds.width, height: bounds.height, opacity: getComputedStyle(card).opacity };
        });
        return {
          theme: document.documentElement.className,
          overflow: document.documentElement.scrollWidth > innerWidth,
          headings: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
          columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
          cards,
          hiddenText: Array.from(document.querySelectorAll('main section, main h2, main footer')).filter(el => getComputedStyle(el).opacity !== '1').length,
          headerVisible: document.querySelector('header').getBoundingClientRect().height > 0,
          devControls: !!document.querySelector('nextjs-portal'),
        };
      });
      assert.equal(state.overflow, false, `${theme}/${width}: overflow`);
      assert.equal(state.headings.filter(h => h === 'Start with a little inspiration').length, 1);
      assert.equal(state.cards.length, 6);
      assert.equal(state.columns, width > 1024 ? 3 : width > 600 ? 2 : 1);
      assert.ok(state.cards.every(c => c.width > 100 && c.height > 100 && c.opacity === '1'));
      assert.equal(state.hiddenText, 0);
      assert.equal(state.headerVisible, true);
      assert.equal(state.devControls, false);
      await page.screenshot({ path: `artifacts/landing-audit/${theme}-${width}.png`, fullPage: true });
      results.push({ width, ...state });
    }
    // Theme persistence, keyboard focus, and accessible mobile dialog.
    await page.getByRole('button', { name: 'Toggle light and dark theme' }).click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('html').getAttribute('class'), theme === 'dark' ? 'light' : 'dark');
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => ({ tag: document.activeElement.tagName, outline: getComputedStyle(document.activeElement).outlineStyle }));
    assert.notEqual(focus.tag, 'BODY');
    assert.notEqual(focus.outline, 'none');
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    assert.equal(await page.getByRole('dialog').isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    results.push({ theme, errors: [...new Set(errors)], focus, persistence: 'passed', mobileMenu: 'passed' });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync('artifacts/landing-audit/results.json', JSON.stringify(results, null, 2));
  console.log('Passed both themes at all five widths; saved screenshots and results.');
})().catch(error => { console.error(error); process.exit(1); });


