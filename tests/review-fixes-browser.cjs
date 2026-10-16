const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/credits', route => route.fulfill({ json: { isAuthenticated: true, isPremium: false, remaining: 2, capacity: 2, resetInfo: null } }));
    const ids = [], receipts = new Set();
    await page.route('**/api/aimodel', async route => {
      const body = route.request().postDataJSON(); ids.push(body.requestId); receipts.add(body.requestId);
      assert.equal(body.tripSpec.destination, 'Kyoto'); assert.equal(body.tripSpec.tripDuration, '7');
      await route.fulfill({ json: { trip_plan: { destination: 'Kyoto', origin: 'Mumbai', duration: '7 days', group_size: 'Couple', budget: 'High', hotels: [], itinerary: [{ day: 1, activities: [] }] }, credits: { isAuthenticated: true, isPremium: false, remaining: 1, capacity: 2, resetInfo: null } } });
    });
    await page.goto('http://127.0.0.1:3201/create-new-trip?tripId=fixture&fixture=final');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByLabel('Starting from').fill('Mumbai'); await page.getByLabel('Destination', { exact: true }).fill('Kyoto');
    await page.getByLabel('Travelers', { exact: true }).selectOption('Couple'); await page.getByLabel('Budget', { exact: true }).selectOption('High');
    await page.getByLabel('Duration in days').fill('7'); await page.getByRole('button', { name: 'Save changes' }).click();
    await page.evaluate(() => { window.fixtureFailSave = true; });
    await page.getByRole('button', { name: 'Generate plan', exact: true }).click();
    await page.getByRole('button', { name: 'Retry generation' }).waitFor();
    await page.evaluate(() => { window.fixtureFailSave = false; });
    await page.getByRole('button', { name: 'Retry generation' }).click();
    await page.getByText('Your trip is generated.', { exact: true }).waitFor();
    assert.equal(ids.length, 2); assert.equal(ids[0], ids[1], 'Save failure retains the generation receipt ID'); assert.equal(receipts.size, 1);
    const saves = await page.evaluate(() => window.fixtureMutations.filter(item => item.operation.includes('CreateTripDetail')));
    assert.equal(saves.length, 2); assert.ok(saves.every(item => item.tripId === 'fixture'));
    await page.evaluate(() => { window.fixtureFailDelete = true; });
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Conversation options' }).click(); await page.getByRole('menuitem', { name: 'Delete trip' }).click();
    await page.getByRole('alert').filter({ hasText: 'could not be deleted' }).waitFor();
    assert.equal(await page.evaluate(() => window.fixtureNavigation), undefined);
    await page.evaluate(() => { window.fixtureFailDelete = false; });
    await page.getByRole('button', { name: 'Conversation options' }).click(); await page.getByRole('menuitem', { name: 'Delete trip' }).click();
    await page.waitForFunction(() => window.fixtureNavigation === '/dashboard');
    assert.ok(await page.evaluate(() => window.fixtureMutations.some(item => item.operation.includes('DeleteTrip') && item.tripId === 'fixture')));
    await page.goto('http://127.0.0.1:3201/create-new-trip?fixture=notes');
    const note = page.getByLabel('Your private notes'); await note.waitFor();
    await page.waitForFunction(() => document.querySelector('textarea')?.value === 'Remember the old note');
    await note.fill('');
    await page.waitForFunction(() => window.fixtureMutations.some(item => item.operation.includes('UpdateNote') && item.note === ''));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log('PASS', width, 'edited inputs, save retry identity, delete success/failure, empty note');
    await page.close();
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
