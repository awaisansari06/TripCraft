const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');

// Execute the real route code, replacing external billing/auth/model transports.
function load(file, mocks = {}, globals = {}) {
  mocks = {
    '@/lib/request-limits': { reserveRequest: async () => ({ allowed: true }), releaseRequest: async () => {} },
    '@/lib/trip-spec': loadSpec(),
    ...mocks,
  };
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(js, { module, exports: module.exports, require: name => mocks[name] ?? require(name), console: { log() {}, error() {} }, process, Error, Buffer, URL, URLSearchParams, AbortSignal, crypto: require('node:crypto').webcrypto, setTimeout, ...globals }, { filename: file });
  return module.exports;
}
function loadSpec() {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/trip-spec.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module, exports: module.exports });
  return module.exports;
}
const request = body => new NextRequest('http://localhost/api/aimodel', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) });
const conversation = { messages: [{ role: 'user', content: 'Generate my full travel plan now' }], isFinal: true, requestId: 'request-1234' };
const plan = { hotels: [], itinerary: [{ day: 1, activities: [] }] };

test('AI route validates auth/input, handles failure, charges successful results and reuses retries', async () => {
  let account = { userId: 'test', capacity: 2 }, balance = 2, cached = null, readsFail = false, denied = false, charges = 0, modelCalls = 0;
  let modelText = JSON.stringify({ trip_plan: plan });
  const routes = load('app/api/aimodel/route.tsx', {
    '@/lib/trip-credits': {
      getCreditAccount: async () => account,
      readTripCredits: async () => { if (readsFail) throw new Error('Credit service unavailable'); return { info: { remaining: balance }, tripPlan: cached }; },
      commitTripPlan: async (_, id, tripPlan) => { charges++; return { denied, info: { remaining: --balance }, tripPlan }; },
    },
    '@google/generative-ai': { GoogleGenerativeAI: class { getGenerativeModel() { return { startChat: () => ({ sendMessage: async () => { modelCalls++; return { response: { text: () => modelText } }; } }) }; } } },
  });
  account = null;
  assert.equal((await routes.POST(request(conversation))).status, 401);
  account = { userId: 'test', capacity: 2 };
  assert.equal((await routes.POST(request('{'))).status, 400);
  assert.equal((await routes.POST(request({ messages: [] }))).status, 400);
  assert.equal((await routes.POST(request({ ...conversation, isFinal: 'yes' }))).status, 400);
  balance = 0;
  assert.equal((await routes.POST(request(conversation))).status, 429);
  assert.equal(modelCalls, 0);
  balance = 1;
  const last = await routes.POST(request(conversation));
  assert.equal(last.status, 200);
  assert.equal((await last.json()).credits.remaining, 0);
  assert.equal(charges, 1);
  cached = plan;
  assert.equal((await routes.POST(request(conversation))).status, 200);
  assert.equal(charges, 1);
  cached = null; balance = 2; modelText = '{}';
  assert.equal((await routes.POST(request(conversation))).status, 502);
  assert.equal(charges, 1);
  modelText = JSON.stringify({ resp: 'Where would you like to go?' });
  assert.equal((await routes.POST(request({ ...conversation, isFinal: false }))).status, 200);
  assert.equal(charges, 1);
  modelText = JSON.stringify({ trip_plan: plan }); denied = true;
  assert.equal((await routes.POST(request(conversation))).status, 429);
  readsFail = true;
  assert.equal((await routes.POST(request(conversation))).status, 503);
});

test('credit status never substitutes full capacity for a service failure', async () => {
  let account = null, fail = false;
  const route = load('app/api/credits/route.ts', { '@/lib/trip-credits': {
    getCreditAccount: async () => account,
    readTripCredits: async () => { if (fail) throw new Error('offline'); return { info: { remaining: 99, capacity: 100 } }; },
  } });
  assert.equal((await route.GET()).status, 401);
  account = {};
  const response = await route.GET();
  assert.equal((await response.json()).remaining, 99);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  fail = true;
  assert.equal((await route.GET()).status, 503);
});

test('profile returns only the authenticated user profile', async () => {
  let user = null;
  const route = load('app/api/profile/route.ts', { '@clerk/nextjs/server': { currentUser: async () => user } });
  assert.equal((await route.GET()).status, 401);
  user = { id: 'test', fullName: 'Test User', primaryEmailAddress: { emailAddress: 'test@example.com' }, imageUrl: 'image', privateMetadata: { secret: 'hidden' } };
  const response = await route.GET();
  const body = await response.json();
  assert.equal(body.id, 'test');
  assert.equal(body.privateMetadata, undefined);
});

test('place API validates requests, hides the provider key and verifies signed photos', async () => {
  const original = process.env.GOOGLE_PLACE_API_KEY;
  process.env.GOOGLE_PLACE_API_KEY = 'verification-only-not-a-real-key';
  let authenticated = false, upstreamStatus = 200;
  const route = load('app/api/google-place-detail/route.ts', { '@clerk/nextjs/server': { currentUser: async () => authenticated ? {} : null } }, {
    fetch: async url => String(url).includes('searchText')
      ? new Response(JSON.stringify({ places: [{ photos: [{ name: 'places/test/photos/photo' }] }] }), { status: upstreamStatus })
      : new Response('image', { headers: { 'Content-Type': 'image/png' } }),
  });
  try {
    assert.equal((await route.POST(request({ placeName: 'Goa' }))).status, 401);
    authenticated = true;
    assert.equal((await route.POST(request({ placeName: '' }))).status, 400);
    assert.equal((await route.POST(request('{'))).status, 400);
    const response = await route.POST(request({ placeName: 'Goa' }));
    const urls = await response.json();
    assert(!urls[0].includes(process.env.GOOGLE_PLACE_API_KEY));
    assert.equal((await route.GET(new NextRequest('http://localhost'+urls[0]))).status, 200);
    assert.equal((await route.GET(new NextRequest('http://localhost/api/google-place-detail?photo=invalid'))).status, 403);
    upstreamStatus = 429;
    assert.equal((await route.POST(request({ placeName: 'Goa' }))).status, 503);
    upstreamStatus = 500;
    assert.equal((await route.POST(request({ placeName: 'Goa' }))).status, 502);
  } finally { if (original === undefined) delete process.env.GOOGLE_PLACE_API_KEY; else process.env.GOOGLE_PLACE_API_KEY = original; }
});

test('credit refill and plan changes preserve usage without negative balances', () => {
  const { availableCredits, CREDIT_REFILL_MS } = load('lib/credit-policy.ts');
  const state = { remaining: 0, capacity: 2, updatedAt: 1000 };
  assert.equal(availableCredits(state, 2, 1001).remaining, 0);
  assert.equal(availableCredits(state, 2, 1000 + CREDIT_REFILL_MS).remaining, 1);
  assert.equal(availableCredits(state, 100, 1001).remaining, 98);
  assert.equal(availableCredits({ remaining: 99, capacity: 100, updatedAt: 1000 }, 2, 1001).remaining, 2);
});

test('AI uses edited canonical details, rejects invalid duration and stops before provider work when limited', async () => {
  let prompt = '', calls = 0, releases = 0, allowed = true;
  const route = load('app/api/aimodel/route.tsx', {
    '@/lib/trip-credits': {
      getCreditAccount: async () => ({ userId: 'test', capacity: 2 }),
      readTripCredits: async () => ({ info: { remaining: 2 }, tripPlan: null }),
      commitTripPlan: async (_, id, result) => ({ denied: false, info: { remaining: 1 }, tripPlan: result }),
    },
    '@/lib/request-limits': {
      reserveRequest: async () => ({ allowed, retryAfter: 10 }),
      releaseRequest: async () => { releases++; },
    },
    '@google/generative-ai': { GoogleGenerativeAI: class { getGenerativeModel() { return { startChat: options => {
      prompt = options.systemInstruction.parts[0].text;
      return { sendMessage: async () => { calls++; return { response: { text: () => JSON.stringify({ trip_plan: plan }) } }; } };
    } }; } } },
  });
  const edited = { ...conversation, tripSpec: { source: 'Mumbai', destination: 'Kyoto', tripDuration: 7, budget: 'High' } };
  assert.equal((await route.POST(request(edited))).status, 200);
  assert.ok(prompt.includes('override earlier conversation answers'));
  assert.ok(prompt.includes('"destination":"Kyoto"'));
  assert.ok(prompt.includes('"tripDuration":"7"'));
  assert.equal(releases, 1);
  assert.equal((await route.POST(request({ ...edited, tripSpec: { tripDuration: 31 } }))).status, 400);
  allowed = false;
  const denied = await route.POST(request(edited));
  assert.equal(denied.status, 429); assert.equal(denied.headers.get('retry-after'), '10');
  assert.equal(calls, 1); assert.equal(releases, 1);
});
