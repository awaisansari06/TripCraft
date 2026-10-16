const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/muham/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const routes = ['/', '/pricing', '/contact-us', '/dashboard', '/create-new-trip', '/terms-of-service', '/privacy-policy'];

  for (const route of routes) {
    console.log(`\nTesting page refresh and scroll animations on ${route}...`);

    // 1. Initial navigation / refresh
    await page.goto(BASE_URL + route);
    await page.waitForTimeout(100);

    // Verify progress bar is present
    const progressBar = page.locator('.tc-page-progress-bar');
    assert.equal(await progressBar.count(), 1, `Progress bar exists on ${route}`);

    // Wait for initial load to finish settling
    await page.waitForTimeout(1500);
    assert.equal(await page.locator('[data-revealing]').count(), 0, `All initial reveals finished on ${route}`);

    // 2. Refresh page to test refresh loading animation
    console.log(`Refreshing ${route}...`);
    await page.reload();

    // Verify progress bar animated on reload
    await page.waitForTimeout(150);
    assert.equal(await progressBar.count(), 1, `Progress bar active on reload of ${route}`);

    // Wait for reload to settle
    await page.waitForTimeout(1500);
    assert.equal(await page.locator('[data-revealing]').count(), 0, `Reveals settled after reload on ${route}`);

    // 3. Scroll down ("hovering down")
    console.log(`Scrolling down on ${route}...`);
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    const scrollSteps = [300, 600, 900, Math.min(1500, totalHeight)];

    for (const y of scrollSteps) {
      if (y < totalHeight) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: 'smooth' }), y);
        await page.waitForTimeout(200);
      }
    }

    // Verify Back-to-Top button becomes visible on scroll down
    if (totalHeight > 900) {
      const backToTop = page.locator('.tc-back-to-top');
      await page.waitForTimeout(300);
      const isVisible = await backToTop.getAttribute('data-visible');
      assert.equal(isVisible, 'true', `Back-to-top button visible on ${route} after scroll down`);

      // 4. Scroll up ("going up")
      console.log(`Scrolling back up on ${route}...`);
      await backToTop.click();
      await page.waitForTimeout(700);

      const topY = await page.evaluate(() => window.scrollY);
      assert.ok(topY < 100, `Smoothly scrolled back to top on ${route} (scrollY: ${topY})`);
    }

    // Verify all revealing attributes settled to 0
    await page.waitForTimeout(400);
    assert.equal(await page.locator('[data-revealing]').count(), 0, `Clean state on ${route}`);
    console.log(`✓ ${route} passed all refresh & scroll tests!`);
  }

  await browser.close();
  console.log('\nALL REFRESH AND SCROLL TESTS PASSED SUCCESSFULLY! 🎉');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
