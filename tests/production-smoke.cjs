const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.APP_BASE_URL || 'http://localhost:3100';
const out = 'artifacts/production-audit';
(async () => {
  const results = [];
  for (const route of ['/', '/pricing', '/contact-us', '/privacy-policy', '/terms-of-service', '/sign-in', '/sign-up', '/robots.txt', '/sitemap.xml']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(response.headers.get('x-powered-by'), null);
    const body = await response.text();
    if (route.startsWith('/sign-')) assert.match(body, /noindex/);
    if (route === '/sitemap.xml') assert.doesNotMatch(body, /<loc>[^<]*(dashboard|create-new-trip|sign-in|sign-up)/);
    if (route === '/robots.txt') assert.match(body, /Disallow: \/dashboard/);
    results.push({ route, result: 'PASS', httpStatus: response.status, securityHeaders: true });
  }
  for (const route of ['/dashboard', '/create-new-trip']) {
    const r = await fetch(base + route, { redirect: 'manual' });
    assert.ok([302, 303, 307, 308].includes(r.status), `${route} redirects`);
    assert.ok(r.headers.get('location')?.includes('sign-in'), `${route} requires sign-in`);
    results.push({ route, result: 'PASS', anonymousRedirect: r.status });
  }
  for (const [route, method] of [['/api/aimodel', 'POST'], ['/api/google-place-detail', 'POST'], ['/api/profile', 'GET'], ['/api/credits', 'GET'], ['/api/arcjet', 'GET']]) {
    const r = await fetch(base + route, { method, ...(method === 'POST' ? { body: '{}', headers: { 'Content-Type': 'application/json' } } : {}) });
    assert.equal(r.status, 401, route);
    assert.equal(r.headers.get('cache-control'), 'private, no-store');
    const body = await r.json(); assert.ok(body.error || body.isAuthenticated === false);
    results.push({ route, method, result: 'PASS', anonymousStatus: r.status });
  }
  const forged = await fetch(base + '/api/google-place-detail?photo=invalid');
  assert.equal(forged.status, 403);
  results.push({ route: '/api/google-place-detail?photo=invalid', result: 'PASS', forgedPhotoRejected: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.locator('.tc-nav-account').filter({ hasText: 'Sign in' }).waitFor({ timeout: 60000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.querySelector('#dream-trip')?.placeholder.startsWith('Plan a relaxing weekend'), { timeout: 30000 });
  const typingPlaceholder = await page.locator('#dream-trip').getAttribute('placeholder');
  await page.locator('#dream-trip').focus();
  assert.equal(await page.locator('#dream-trip').getAttribute('placeholder'), 'Where would you like to go?');
  await page.locator('#dream-trip').fill('A quiet week in Kyoto');
  await page.locator('form').filter({ has: page.locator('#dream-trip') }).getByRole('button', { name: 'Plan my trip' }).click();
  await page.waitForURL('**/sign-in**');
  const redirect = new URL(page.url()).searchParams.get('redirect_url');
  assert.equal(redirect, '/create-new-trip?query=A%20quiet%20week%20in%20Kyoto');
  assert.deepEqual(errors, []);
  results.push({ route: '/', result: 'PASS', guestPlanningPreservesPrompt: true, settledGuestNavbar: true, rotatingTypewriter: typingPlaceholder.startsWith('Plan a relaxing weekend') });
  await context.close(); await browser.close();
  fs.writeFileSync(out + '/route-smoke.json', JSON.stringify(results, null, 2));
  console.log('Production public routes, security headers, anonymous protections, signed-photo rejection and guest planning redirect passed.');
})().catch(e => { console.error(e); process.exit(1); });
