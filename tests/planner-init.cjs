const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const requests = [];
    await page.route('**/api/credits', route => route.fulfill({ json: { isAuthenticated: true, remaining: 2, capacity: 2, isPremium: false } }));
    await page.route('**/api/aimodel', route => {
      requests.push(route.request().postDataJSON());
      return route.fulfill({ json: { resp: 'What would you enjoy in Kyoto?', ui: 'interests' } });
    });
    await page.goto('http://127.0.0.1:3201/create-new-trip?fixture=empty-conversation&query=A%20quiet%20week%20in%20Kyoto');
    await page.getByText('What would you enjoy in Kyoto?', { exact: true }).waitFor();
    const tripId = new URL(page.url()).searchParams.get('tripId');
    assert.ok(tripId); assert.equal(new URL(page.url()).searchParams.has('query'), false);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].messages.at(-1).content, 'A quiet week in Kyoto');
    const saved = await page.evaluate(() => window.fixtureMutations.filter(m => m.role === 'user'));
    assert.equal(saved.length, 1); assert.equal(saved[0].tripId, tripId);
    await page.goto('http://127.0.0.1:3201/create-new-trip?tripId=existing&query=Do%20not%20replay');
    await page.waitForFunction(() => !new URLSearchParams(location.search).has('query'));
    assert.equal(requests.length, 1, 'An existing conversation must not replay the landing prompt');
    await page.getByText(/Let’s plan your next adventure/).waitFor();
    await page.goto('http://127.0.0.1:3201/create-new-trip?tripId=legacy&fixture=legacy');
    await page.getByText('Here is the plan for your trip to Kyoto', { exact: true }).waitFor();
    assert.equal(requests.length, 1);
    fs.writeFileSync('artifacts/production-audit/planner-init.json', JSON.stringify({ result: 'PASS', generatedTripId: true, initialPromptSentOnce: true, savedToMatchingConversation: true, existingConversationNotReplayed: true, cachedLegacyPlanRestored: true }, null, 2));
    console.log('Planner initialization, stable URL identity, one-time landing prompt and existing-conversation restoration passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
