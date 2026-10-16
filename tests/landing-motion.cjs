const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const BASE_URL = process.env.LANDING_URL || 'http://localhost:3102';
const output = process.env.MOTION_OUTPUT || 'artifacts/landing-motion';
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  for (const theme of ['light', 'dark']) {
    for (const width of [1440, 1280, 1024, 768, 390]) {
      const touch = width <= 768;
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'no-preference', hasTouch: touch });
      await context.addInitScript(theme => localStorage.setItem('theme', theme), theme);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('main')?.style.getPropertyValue('--scroll-progress') !== '');
      await page.locator('main img').evaluateAll(images => images.forEach(image => image.loading = 'eager'));
      await page.waitForFunction(() => Array.from(document.querySelectorAll('main img')).every(img => img.complete && img.naturalWidth > 0));
      await page.locator('main img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      // The unvisited destinations are visible before any observer callback.
      assert.ok(await page.locator('#destinations [data-reveal]').evaluateAll(cards => cards.every(card => getComputedStyle(card).opacity === '1')));
      const toggle = page.getByRole('button', { name: 'Toggle light and dark theme' });
      const layout = () => page.evaluate(() => ({ height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth }));
      const beforeTheme = await layout();
      await toggle.click();
      await page.waitForTimeout(260);
      assert.deepEqual(await layout(), beforeTheme);
      await toggle.click();
      await page.waitForTimeout(260);
      let animatedSamples = 0;
      await page.evaluate(() => document.fonts.ready);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 550) {
        await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
        await page.waitForTimeout(100);
        animatedSamples += await page.locator('[data-revealing="true"]').count();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      }
      await page.waitForFunction(() => !document.querySelector('[data-revealing="true"]'));
      assert.ok(animatedSamples > 0, 'Scroll must actually trigger reveals');
      await page.waitForFunction(() => document.querySelectorAll('#destinations a[data-revealed="true"]').length === 6);
      await page.evaluate(() => {
        const visited = new WeakSet(document.querySelectorAll('[data-revealed="true"]'));
        window.replayedReveals = 0;
        new MutationObserver(records => records.forEach(record => {
          if (record.target.hasAttribute('data-revealing') && visited.has(record.target)) window.replayedReveals++;
        })).observe(document.querySelector('main'), { attributes: true, attributeFilter: ['data-revealing'], subtree: true });
      });
      const revealedCount = await page.locator('[data-revealed="true"]').count();
      assert.equal(await page.locator('#destinations a[data-revealed="true"]').count(), 6);
      assert.equal(await page.locator('header').getAttribute('data-scrolled'), 'true');
      // Theme changes after scrolling preserve geometry and all card positions.
      const afterScroll = await layout();
      await toggle.click();
      await page.waitForTimeout(260);
      assert.deepEqual(await layout(), afterScroll);
      await toggle.click();
      await page.waitForTimeout(260);
      for (let y = height; y >= 0; y -= 700) {
        await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
        await page.waitForTimeout(35);
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(300);
      assert.ok(await page.locator('[data-revealed="true"]').count() >= revealedCount);
      assert.equal(await page.evaluate(() => window.replayedReveals), 0);
      assert.equal(await page.locator('[data-revealing="true"]').count(), 0);
      assert.equal(await page.locator('header').getAttribute('data-scrolled'), 'false');
      const parallax = await page.locator('main').evaluate(el => el.style.getPropertyValue('--hero-shift'));
      if (touch) assert.equal(parallax, '0px');
      const card = page.locator('#templates [data-depth]').first();
      await card.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await page.waitForTimeout(250);
      assert.notEqual(await card.evaluate(el => getComputedStyle(el).outlineStyle), 'none');
      assert.equal(await card.evaluate(el => getComputedStyle(el).opacity), '1');
      if (!touch) {
        await card.hover();
        await page.waitForTimeout(280);
        assert.notEqual(await card.evaluate(el => getComputedStyle(el).transform), 'none');
        assert.equal(await card.evaluate(el => getComputedStyle(el, '::before').opacity), '1');
        assert.match(await card.evaluate(el => getComputedStyle(el, '::before').animationName), /borderSweep/);
        assert.notEqual(await card.locator('img:visible').first().evaluate(el => getComputedStyle(el).transform), 'none');
      }
      await page.getByRole('button', { name: 'Goa weekend' }).click();
      const submit = page.getByRole('button', { name: 'Plan my trip' });
      assert.equal(await submit.isEnabled(), true);
      if (!touch) {
        await submit.hover();
        await page.mouse.down();
        await page.waitForTimeout(220);
        assert.notEqual(await submit.evaluate(el => getComputedStyle(el).transform), 'none');
        // Release away from the form to avoid submitting a real trip.
        await page.mouse.move(1, 1);
        await page.mouse.up();
      }
      await page.locator('body').click({ position: { x: 2, y: 2 } });
      await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
      await page.waitForTimeout(300);
      const finalState = await page.locator('[data-reveal]').evaluateAll(elements => elements.map(el => ({ opacity: getComputedStyle(el).opacity, translate: getComputedStyle(el).translate })));
      assert.ok(finalState.every(el => el.opacity === '1' && ['none', '0px', '0px 0px'].includes(el.translate)));
      // The decorative typewriter caret intentionally loops until reduced motion.
      await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== "running" || animation.effect?.target?.matches?.('.tc-typewriter i')));
      await page.screenshot({ path: `${output}/${theme}-${width}.png`, fullPage: true });
      // Changing the OS setting during a reveal cancels all nonessential movement.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(50);
      assert.equal(await page.locator('[data-revealing="true"]').count(), 0);
      assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), 0);
      assert.equal(await page.locator('main').evaluate(el => el.style.getPropertyValue('--hero-shift')), '');
      assert.deepEqual(errors, []);
      results.push({ theme, width, touch, animatedSamples, revealedCount, errors, settled: true, reducedMotion: true });
      await context.close();
    }
  }
  // Failed initialization cannot hide content.
  for (const disabled of ['observer', 'javascript']) {
    const context = await browser.newContext({ javaScriptEnabled: disabled !== 'javascript', reducedMotion: 'reduce' });
    if (disabled === 'observer') await context.addInitScript(() => { window.IntersectionObserver = undefined; });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#destinations a[data-depth]').count(), 6);
    assert.ok(await page.locator('[data-reveal]').evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1')));
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log('Motion, hover/press/focus, theme geometry, touch, reduced-motion, and failure visibility checks passed at every width in both themes.');
})().catch(error => { console.error(error); process.exit(1); });
