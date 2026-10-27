const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, env = {}, mocks = {}) {
  const module = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, require: name => mocks[name] ?? require(name), process: { env }, URL });
  return module.exports;
}

test('JSON reader accepts bounded data and rejects malformed/empty bodies', async () => {
  const { readJsonBody } = load('lib/request-body.ts');
  const req = body => new Request('http://localhost', { method: 'POST', body });
  const result = await readJsonBody(req('{"text":"Kyoto"}'), 64);
  assert.equal(result.ok, true); assert.equal(result.value.text, 'Kyoto');
  for (const body of ['', '{']) {
    const invalid = await readJsonBody(req(body), 64);
    assert.equal(invalid.ok, false); assert.equal(invalid.status, 400);
  }
});

test('body limits apply before parsing, with Content-Length and chunked streams', async () => {
  const { readJsonBody } = load('lib/request-body.ts');
  const declared = new Request('http://localhost', { method: 'POST', body: '{}', headers: { 'Content-Length': '1000' } });
  assert.equal((await readJsonBody(declared, 16)).status, 413);
  let cancelled = false;
  const stream = new ReadableStream({
    start(c) { c.enqueue(new Uint8Array(12)); c.enqueue(new Uint8Array(12)); },
    cancel() { cancelled = true; },
  });
  const chunked = new Request('http://localhost', { method: 'POST', body: stream, duplex: 'half' });
  assert.equal((await readJsonBody(chunked, 16)).status, 413);
  assert.equal(cancelled, true);
  assert.equal(stream.locked, false);
});

test('broken request streams return a safe parse error and release their lock', async () => {
  const { readJsonBody } = load('lib/request-body.ts');
  const stream = new ReadableStream({ start(c) { c.error(new Error('internal transport detail')); } });
  const result = await readJsonBody(new Request('http://localhost', { method: 'POST', body: stream, duplex: 'half' }), 64);
  assert.equal(result.status, 400); assert.equal(result.error, 'Invalid JSON body');
  assert.equal(stream.locked, false);
});

test('public metadata uses only an explicit origin; private routes stay out of sitemap', () => {
  const missing = load('lib/site-metadata.ts').publicPageMetadata('Pricing', 'Plans', '/pricing');
  assert.equal(missing.alternates, undefined);
  const configured = load('lib/site-metadata.ts', { SITE_URL: 'https://deployment.example' });
  const metadata = configured.publicPageMetadata('Pricing', 'Plans', '/pricing');
  assert.equal(metadata.alternates.canonical, 'https://deployment.example/pricing');
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  const sitemap = load('app/sitemap.ts', {}, { '@/lib/site-metadata': configured }).default();
  assert.equal(sitemap.length, 5);
  assert.equal(sitemap.some(item => /dashboard|create-new-trip|sign-in|sign-up|api\//.test(item.url)), false);
  assert.equal(load('app/sitemap.ts', {}, { '@/lib/site-metadata': load('lib/site-metadata.ts') }).default().length, 0);
  for (const invalid of ['javascript:alert(1)', 'https://u:p@deployment.example', 'https://deployment.example/pricing', 'https://deployment.example?q=1']) {
    assert.throws(() => load('lib/site-metadata.ts', { SITE_URL: invalid }).siteOrigin(), /SITE_URL/);
  }
});
