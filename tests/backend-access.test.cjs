const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const validator = new Proxy(() => validator, { get: () => validator, apply: () => validator });
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} }; cache.set(file, module.exports);
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, process, Date, require: name => {
    if (name === 'convex/values') return { v: validator };
    if (name === './_generated/server') return { query: x => x, mutation: x => x };
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
    return require(name);
  } }, { filename: file });
  return module.exports;
}
function fixture() {
  const tables = { UserTable: [{ _id: 'alice', email: 'alice@example.test', clerkId: 'clerk-alice', name: 'Alice', imageUrl: '' }, { _id: 'bob', email: 'bob@example.test', clerkId: 'clerk-bob', name: 'Bob', imageUrl: '' }], TripSessions: [], TripDetailTable: [], MessagesTable: [], SavedPlacesTable: [], RequestLimits: [], TripCreditAccounts: [], TripCreditReceipts: [] };
  let who = { subject: 'clerk-alice', email: 'alice@example.test', emailVerified: true };
  let nextId = 0;
  const db = {
    query(table) {
      let rows = [...tables[table]];
      const q = { eq: (field, value) => row => row[field] === value, field: field => field };
      const chain = {
        withIndex(_, callback) { const index = { eq(field, value) { rows = rows.filter(row => row[field] === value); return index; } }; callback(index); return chain; },
        filter(callback) { rows = rows.filter(callback(q)); return chain; },
        order() { return chain; }, first: async () => rows[0] || null,
        unique: async () => { assert.ok(rows.length <= 1); return rows[0] || null; }, collect: async () => rows,
      }; return chain;
    },
    async insert(table, data) { const _id = table + ++nextId; tables[table].push({ ...data, _id }); return _id; },
    async patch(id, data) { const row = Object.values(tables).flat().find(row => row._id === id); assert.ok(row); Object.assign(row, data); },
    async delete(id) { for (const table of Object.values(tables)) { const i = table.findIndex(row => row._id === id); if (i >= 0) table.splice(i, 1); } },
  };
  return { tables, ctx: { db, auth: { getUserIdentity: async () => who } }, as: value => { who = value; } };
}
const trips = load('convex/tripDetail.ts'), chat = load('convex/chat.ts'), saved = load('convex/savedPlaces.ts'), users = load('convex/user.ts');

test('all public data handlers reject anonymous callers and forged owners', async () => {
  const f = fixture(); f.tables.TripDetailTable.push({ _id: 'trip', tripId: 'private-trip', uid: 'bob', tripDetail: {} });
  const calls = [
    () => trips.GetTrip.handler(f.ctx, { tripId: 'private-trip' }),
    () => trips.UpdateTrip.handler(f.ctx, { tripId: 'private-trip', tripDetail: {} }),
    () => trips.CreateTripDetail.handler(f.ctx, { tripId: 'private-trip', uid: 'bob', tripDetail: {} }),
    () => trips.GetUserTrips.handler(f.ctx, { uid: 'bob' }),
    () => trips.DeleteTrip.handler(f.ctx, { tripId: 'private-trip' }),
    () => chat.GetMessages.handler(f.ctx, { tripId: 'private-trip' }),
    () => chat.SendMessage.handler(f.ctx, { tripId: 'private-trip', role: 'user', content: 'forged' }),
    ...Object.values(saved).map(operation => () => operation.handler(f.ctx, { userId: 'bob@example.test', placeName: 'Private', note: '', placeType: 'hotel', metadata: {} })),
    () => users.GetUser.handler(f.ctx, { email: 'bob@example.test' }),
    () => users.CreateNewUser.handler(f.ctx, { email: 'bob@example.test', name: 'Forged', imageUrl: '' }),
  ];
  for (const call of calls) await assert.rejects(call);
  f.as(null); for (const call of calls) await assert.rejects(call);
  assert.equal(f.tables.TripDetailTable[0].uid, 'bob');
});

test('one trip ID owns messages and an upserted plan; deletion removes both and preserves billing', async () => {
  const f = fixture(), tripId = 'stable-trip-id';
  await chat.SendMessage.handler(f.ctx, { tripId, role: 'user', content: 'Tokyo' });
  await trips.CreateTripDetail.handler(f.ctx, { tripId, uid: 'alice', tripDetail: { destination: 'Tokyo' } });
  await trips.CreateTripDetail.handler(f.ctx, { tripId, uid: 'alice', tripDetail: { destination: 'Kyoto' } });
  assert.equal(f.tables.TripDetailTable.length, 1);
  assert.equal((await trips.GetTrip.handler(f.ctx, { tripId })).tripDetail.destination, 'Kyoto');
  assert.equal((await chat.GetMessages.handler(f.ctx, { tripId })).length, 1);
  f.tables.TripCreditReceipts.push({ _id: 'receipt' });
  await trips.DeleteTrip.handler(f.ctx, { tripId });
  assert.equal(f.tables.TripDetailTable.length, 0); assert.equal(f.tables.MessagesTable.length, 0);
  assert.equal(f.tables.TripCreditReceipts.length, 1);
  await assert.rejects(() => chat.SendMessage.handler(f.ctx, { tripId, role: 'user', content: 'Recreate' }));
});

test('owned legacy trips remain readable; orphan legacy chats cannot be claimed', async () => {
  const f = fixture(); f.tables.TripDetailTable.push({ _id: 'legacy', uid: 'alice', tripId: 'legacy-trip', tripDetail: {} });
  assert.ok(await trips.GetTrip.handler(f.ctx, { tripId: 'legacy-trip' }));
  await chat.SendMessage.handler(f.ctx, { tripId: 'legacy-trip', role: 'user', content: 'Continue' });
  f.tables.MessagesTable.push({ _id: 'orphan', tripId: 'orphan-chat', content: 'private' });
  assert.equal((await chat.GetMessages.handler(f.ctx, { tripId: 'orphan-chat' })).length, 0);
  await assert.rejects(() => chat.SendMessage.handler(f.ctx, { tripId: 'orphan-chat', role: 'user', content: 'Claim' }));
});

test('legacy users bind only to verified identity, ignore browser subscription, and cannot be stolen', async () => {
  const f = fixture(); delete f.tables.UserTable[0].clerkId;
  await users.CreateNewUser.handler(f.ctx, { email: 'alice@example.test', name: 'Alice', imageUrl: '', subscription: 'monthly' });
  assert.equal(f.tables.UserTable[0].clerkId, 'clerk-alice'); assert.equal(f.tables.UserTable[0].subscription, undefined);
  f.as({ subject: 'imposter', email: 'alice@example.test', emailVerified: false });
  await assert.rejects(() => users.CreateNewUser.handler(f.ctx, { email: 'alice@example.test', name: 'Forged', imageUrl: '' }));
  f.as({ subject: 'imposter', email: 'alice@example.test', emailVerified: true });
  await assert.rejects(() => users.CreateNewUser.handler(f.ctx, { email: 'alice@example.test', name: 'Forged', imageUrl: '' }));
});

test('a new verified account can read its empty profile before browser initialization', async () => {
  const f = fixture(); f.as({ subject: 'new-account', email: 'new@example.test', emailVerified: true });
  assert.equal(await users.GetUser.handler(f.ctx, { email: 'new@example.test' }), null);
  await assert.rejects(() => users.GetUser.handler(f.ctx, { email: 'bob@example.test' }));
});

test('saved notes can be emptied by their owner', async () => {
  const f = fixture(), args = { userId: 'alice@example.test', placeName: 'Hotel', placeType: 'hotel', metadata: {} };
  await saved.SavePlace.handler(f.ctx, args);
  await saved.UpdateNote.handler(f.ctx, { ...args, note: 'Old note' });
  await saved.UpdateNote.handler(f.ctx, { ...args, note: '' });
  assert.equal((await saved.GetSavedPlace.handler(f.ctx, args)).notes, '');
});

test('durable limiter blocks duplicates/concurrent AI, releases safely, and caps AI/photo request budgets', async () => {
  const f = fixture(), credits = load('convex/credits.ts');
  const previous = process.env.TRIP_CREDIT_SECRET; process.env.TRIP_CREDIT_SECRET = 'test-only';
  try {
    const args = { secret: 'test-only', userId: 'alice@example.test', scope: 'ai', requestId: 'request-one' };
    assert.equal((await credits.ReserveRequest.handler(f.ctx, args)).allowed, true);
    assert.equal((await credits.ReserveRequest.handler(f.ctx, args)).allowed, false);
    assert.equal((await credits.ReserveRequest.handler(f.ctx, { ...args, requestId: 'request-two' })).allowed, false);
    await credits.ReleaseRequest.handler(f.ctx, { ...args, requestId: 'request-old' });
    assert.equal((await credits.ReserveRequest.handler(f.ctx, args)).allowed, false);
    await credits.ReleaseRequest.handler(f.ctx, args);
    for (let i = 1; i < 12; i++) { assert.equal((await credits.ReserveRequest.handler(f.ctx, args)).allowed, true); await credits.ReleaseRequest.handler(f.ctx, args); }
    assert.equal((await credits.ReserveRequest.handler(f.ctx, args)).allowed, false);
    for (let i = 0; i < 30; i++) assert.equal((await credits.ReserveRequest.handler(f.ctx, { ...args, scope: 'photo' })).allowed, true);
    assert.equal((await credits.ReserveRequest.handler(f.ctx, { ...args, scope: 'photo' })).allowed, false);
    await assert.rejects(() => credits.ReserveRequest.handler(f.ctx, { ...args, secret: 'invalid' }));
    f.tables.RequestLimits[0].windowStart = Date.now() - 61000;
    f.tables.RequestLimits[0].leaseUntil = 0;
    assert.equal((await credits.ReserveRequest.handler(f.ctx, args)).allowed, true);
  } finally { if (previous === undefined) delete process.env.TRIP_CREDIT_SECRET; else process.env.TRIP_CREDIT_SECRET = previous; }
});
