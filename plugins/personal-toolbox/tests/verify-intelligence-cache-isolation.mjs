import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { apply, Config } from '../compat/routing/pi-ai.js';
import { createIntelligenceTestHandler } from '../src/shared/services.js';

// ZERO external requests: the real adapter + SDK are redirected to a loopback
// gateway implementing the provider's documented (URL + API key + exact body)
// response-cache key. All credentials below are synthetic, never user secrets.
const source = (await readFile(new URL('../compat/routing/pi-ai.js', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
const start = source.indexOf('function intelligenceCacheRequest(');
const end = source.indexOf('/**\n* pi-ai-backed multi-provider adapter.', start);
assert.ok(start >= 0 && end > start);
const forwarded = [];
const context = vm.createContext({ URL, Request, Date, randomUUID, fetch: async (input, init) => {
  forwarded.push({ input, init }); return new Response('fixture', { headers: { 'x-cache': 'MISS' } });
} });
const { rewrite, transport } = vm.runInContext(source.slice(start, end) + ';({rewrite:intelligenceCacheRequest,transport:intelligenceTransportOptions})', context);
const base = 'https://cache-a.example.invalid';
const original = base + '/v1/chat/completions?escaped=a%20b&repeated=1&repeated=2';
const marker = 'unit-nonce';
const body = ' {"model":"demo","messages":[{"role":"user","content":"题目原文"}]} ';
const originalInit = { method: 'POST', body, headers: { authorization: 'Bearer UNIT' } };
assert.equal(rewrite(original, originalInit, marker).input, original + '&dsh_intelligence_request=' + marker);
assert.equal(rewrite(new URL(base + '/v1/responses'), originalInit, marker).input.searchParams.get('dsh_intelligence_request'), marker);
const control = new AbortController();
const originalRequest = new Request(original, { ...originalInit, signal: control.signal });
const rewritten = rewrite(originalRequest, undefined, marker).input;
assert.ok(rewritten instanceof Request);
assert.equal(rewritten.method, 'POST'); assert.equal(rewritten.headers.get('authorization'), 'Bearer UNIT');
assert.equal(await rewritten.text(), body);
control.abort(); assert.equal(rewritten.signal.aborted, true);
for (const url of ['https://api.example.com/v1/chat/completions', base + '/api/models', 'http://cache-a.example.invalid/v1/chat/completions', base + ':8443/v1/chat/completions', 'https://cache-a.example.invalid.evil.invalid/v1/chat/completions', 'https://user@cache-a.example.invalid/v1/chat/completions', 'not-a-url']) {
  assert.equal(rewrite(url, originalInit, marker).input, url, 'Unrelated or unexpected destinations never rewritten');
}
assert.equal(rewrite(original, { method: 'GET' }, marker).input, original);
assert.equal(rewrite(original, undefined, marker).input, original);
assert.equal(rewrite('https://cache-b.example.invalid/v1/messages', originalInit, marker).cacheIsolation, 'per-attempt-query');
assert.equal(rewrite(base + '/v1beta/models/test:generateContent', originalInit, marker).cacheIsolation, 'per-attempt-query');
assert.deepEqual(Object.keys(transport({}, 'openai-completions')), []);
assert.deepEqual(Object.keys(transport({ intelligenceRequestId: 'bad\nheader' }, 'openai-completions')), []);
assert.deepEqual(Object.keys(transport({ intelligenceRequestId: 'valid-trace' }, 'google-generative-ai')), []);
const events = [];
const sameAttempt = transport({ intelligenceRequestId: 'unit-attempt', onIntelligenceTransport: e => events.push(e) }, 'openai-completions');
await sameAttempt.fetch(original, originalInit); await sameAttempt.fetch(original, originalInit);
assert.equal(forwarded[0].input, forwarded[1].input, 'Internal reconnect uses the same attempt cache key');
assert.equal(forwarded[0].init, originalInit, 'Request body/headers/signal options are forwarded by identity');
await transport({ intelligenceRequestId: 'unit-attempt' }, 'openai-completions').fetch(original, originalInit);
assert.notEqual(forwarded[2].input, forwarded[0].input, 'New attempt is isolated even if a caller repeats its trace ID');
assert.equal(events[0].cacheIsolation, 'per-attempt-query');
assert.ok(!JSON.stringify(events).includes('UNIT')); assert.ok(!JSON.stringify(events).includes('https://'));

const cache = new Map(), wire = [], generated = [];
const failures = new Map();
let generation = 0;
const server = createServer(async (req, res) => {
  let raw = ''; for await (const chunk of req) raw += chunk;
  const request = JSON.parse(raw), key = JSON.stringify([req.url, req.headers.authorization, raw]);
  let result = cache.get(key);
  const hit = !!result;
  const captured = { path: req.url, raw, request, authorization: req.headers.authorization, requestId: req.headers['x-client-request-id'], hit };
  wire.push(captured);
  if (!result) {
    generation++; generated.push(captured);
    const failTimes = failures.get(request.model) || 0;
    if (failTimes) {
      failures.set(request.model, failTimes - 1);
      result = { status: 503, text: JSON.stringify({ error: { message: 'Fixture temporarily unavailable', type: 'server_error', code: 'server_error' } }) };
    } else {
      const text = request.messages[0].content.includes('鹈鹕') ? '<html><svg><text>mock generation ' + generation + '</text></svg></html>' : '21';
      const chunk = { id: 'fixture-new-' + generation, object: 'chat.completion.chunk', created: 1700000000, model: request.model };
      result = { status: 200, text: `data: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: { role: 'assistant', content: text }, finish_reason: null }] })}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] })}\n\ndata: [DONE]\n\n` };
    }
    cache.set(key, result);
  }
  res.writeHead(result.status, { 'content-type': result.status === 200 ? 'text/event-stream' : 'application/json', 'x-cache': hit ? 'HIT' : 'MISS' });
  res.end(result.text);
});
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
  assert.ok(['cache-a.example.invalid', 'cache-b.example.invalid', 'ordinary.example.invalid'].includes(url.hostname), 'Unexpected outbound URL BLOCKED');
  // No fallback: credentials and all generated requests stay on this local fixture.
  const local = `http://127.0.0.1:${server.address().port}${url.pathname}${url.search}`;
  return nativeFetch(input instanceof Request ? new Request(local, input) : local, init);
};
try {
  let adapter;
  const secrets = { PLUS: 'fixture-plus-not-real', OTHER: 'fixture-other-not-real' };
  const provider = baseURL => ({ api: 'openai-completions', baseURL,
    apiKeys: [{ id: 'plus', name: 'Plus', credentialRef: 'PLUS' }, { id: 'other', name: 'Other', credentialRef: 'OTHER' }], activeApiKey: 'other',
    models: [
      { id: 'demo', apiKey: 'plus', contextWindow: 8192, maxTokens: 1024 },
      { id: 'demo#other', upstreamModelId: 'demo', apiKey: 'other', contextWindow: 8192, maxTokens: 1024 },
      { id: 'sol', apiKey: 'plus', contextWindow: 8192, maxTokens: 1024 },
      { id: 'retry-once', apiKey: 'plus', contextWindow: 8192, maxTokens: 1024 },
      { id: 'always-fails', apiKey: 'plus', contextWindow: 8192, maxTokens: 1024 }
    ] });
  const providers = { fixture: provider(base + '/v1'), relay: provider('https://cache-b.example.invalid/v1'), ordinary: provider('https://ordinary.example.invalid/v1') };
  const originalConfig = JSON.stringify(providers);
  apply({ get: name => name === 'credentials' ? { resolve: async ref => ({ value: secrets[ref] }) } : undefined,
    logger: { warn() {}, error() {} }, inject() {}, fiber: {}, on() {},
    llm: { registerConfigurableProviders: () => ({ replace() {} }), registerModelDiscovery() {}, registerAdapter(_ids, value) { adapter = value; return { replace() {} }; } }
  }, Config({ providers }));
  const handler = createIntelligenceTestHandler(adapter, { retryDelaysMs: [0, 0, 0] });
  const prompts = { pelican: ' 创建一个 HTML，内容是 SVG 绘制一个鹈鹕骑自行车的 2D 动画，不用测试\n', candy: ' 原始糖果问题：最少取出多少个糖果？\n' };
  const run = async (mode, extra = {}) => {
    const response = await handler(new Request('http://localhost/api/intelligence-test', { method: 'POST', body: JSON.stringify({ provider: 'fixture', model: 'demo', requestId: 'deliberately-same-client-id', mode, prompt: prompts[mode], reasoningEffort: 'off', ...extra }) }));
    return { status: response.status, data: await response.json() };
  };
  const ordinaryChat = async (mode, extra = {}) => {
    const chunks = [];
    for await (const c of adapter.stream({ provider: 'fixture', model: 'demo', messages: [{ role: 'user', content: [{ type: 'text', text: prompts[mode] }] }], reasoningEffort: 'off', ...extra })) chunks.push(c);
    return chunks;
  };
  // Reproduce the bug: two new stateless chats still get one cached generation.
  await ordinaryChat('pelican'); await ordinaryChat('pelican');
  assert.equal(wire[0].path, '/v1/chat/completions'); assert.equal(wire[1].hit, true); assert.equal(generated.length, 1);
  const baselineRaw = wire[0].raw;
  const responseIds = new Set();
  for (let round = 0; round < 2; round++) {
    const results = await Promise.all(['pelican', 'candy'].map(mode => run(mode)));
    for (const { status, data } of results) {
      assert.equal(status, 200, JSON.stringify(data)); assert.equal(data.retryCount, 0);
      assert.equal(data.transport.cacheIsolation, 'per-attempt-query'); assert.equal(data.transport.headers['x-cache'], 'MISS');
      responseIds.add(data.upstreamResponseId);
      assert.ok(!JSON.stringify(data).includes('fixture-plus-not-real')); assert.ok(!JSON.stringify(data).includes(base));
    }
  }
  assert.equal(responseIds.size, 4); assert.equal(generated.length, 5);
  const fresh = wire.slice(2);
  assert.equal(new Set(fresh.map(x => x.path)).size, 4);
  for (const call of fresh) {
    assert.equal(call.authorization, 'Bearer ' + secrets.PLUS, 'Model-bound Plus wins over default Other key');
    assert.equal(call.request.model, 'demo');
    assert.deepEqual(call.request.messages, [{ role: 'user', content: call.request.messages[0].content.includes('鹈鹕') ? prompts.pelican : prompts.candy }]);
    assert.equal(call.request.reasoning_effort, undefined); assert.equal(call.request.tools, undefined); assert.equal(call.request.previous_response_id, undefined);
    if (call.request.messages[0].content.includes('鹈鹕')) assert.equal(call.raw, baselineRaw, 'Exact request BODY BYTES unchanged');
  }
  const alias = await run('candy', { model: 'demo#other' }); assert.equal(alias.status, 200);
  assert.equal(wire.at(-1).request.model, 'demo'); assert.equal(wire.at(-1).authorization, 'Bearer ' + secrets.OTHER);
  const anotherModel = await run('pelican', { model: 'sol' }); assert.equal(anotherModel.status, 200);
  assert.equal(wire.at(-1).request.model, 'sol'); assert.equal(wire.at(-1).authorization, 'Bearer ' + secrets.PLUS);
  const relay = await run('candy', { provider: 'relay' }); assert.equal(relay.status, 200); assert.equal(relay.data.transport.cacheIsolation, 'per-attempt-query');
  const unrelated = await run('candy', { provider: 'ordinary' }); assert.equal(unrelated.status, 200);
  assert.equal(wire.at(-1).path, '/v1/chat/completions'); assert.equal(unrelated.data.transport.cacheIsolation, undefined);
  const legacy = await run('candy', { requestId: undefined }); assert.equal(legacy.status, 200);
  assert.match(legacy.data.requestId, /^[0-9a-f-]{36}$/); assert.equal(legacy.data.transport.cacheIsolation, 'per-attempt-query');
  // Errors are cached too. A new attempt bypasses the stale 503, without retrying the sibling.
  failures.set('retry-once', 1);
  const recovered = await run('pelican', { model: 'retry-once' });
  assert.equal(recovered.status, 200); assert.equal(recovered.data.retryCount, 1);
  assert.equal(recovered.data.attemptHistory[0].transport.status, 503); assert.equal(recovered.data.attemptHistory[0].transport.cacheIsolation, 'per-attempt-query');
  const retryWire = wire.filter(x => x.request.model === 'retry-once');
  assert.equal(retryWire.length, 2); assert.notEqual(retryWire[0].path, retryWire[1].path); assert.ok(retryWire.every(x => !x.hit));
  failures.set('always-fails', 100);
  const failed = await run('candy', { model: 'always-fails' });
  assert.equal(failed.status, 502); assert.equal(failed.data.transport.status, 503); assert.equal(failed.data.retryCount, 3);
  const errorWire = wire.filter(x => x.request.model === 'always-fails');
  assert.equal(errorWire.length, 4); assert.equal(new Set(errorWire.map(x => x.path)).size, 4); assert.ok(errorWire.every(x => !x.hit));
  // Chat after detection must still use the originally configured URL/body/key.
  await ordinaryChat('pelican'); assert.equal(wire.at(-1).path, '/v1/chat/completions'); assert.equal(wire.at(-1).raw, baselineRaw); assert.equal(wire.at(-1).hit, true);
  assert.equal(JSON.stringify(providers), originalConfig, 'Configuration never mutated');
  console.log('PASS: reproduced completed-response cache; 2 parallel dual-question rounds -> 4 new local generations; exact body bytes, prompts, Plus/model routing, aliases, ordinary chat and unrelated providers unchanged; retry keys, 503 recovery/persistence, legacy IDs, stable same-attempt nonce, Request/URL/string and abort handling. ZERO paid or external model calls.');
} finally {
  globalThis.fetch = nativeFetch;
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
}
