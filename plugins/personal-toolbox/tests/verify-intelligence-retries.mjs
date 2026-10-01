import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { createIntelligenceTestHandler } from '../src/shared/services.js';

const prompt = ' 原始提示词\n';
const request = (signal, stream = false, extra = {}) => new Request('http://localhost/api/intelligence-test', { method: 'POST', signal, headers: { ...(stream ? { accept: 'application/x-ndjson' } : {}) }, body: JSON.stringify({ requestId: 'test-round-one:pelican', provider: 'fixture', model: 'fixture', mode: 'pelican', prompt, reasoningEffort: 'high', ...extra }) });
const fixture = (stream, extra = {}) => createIntelligenceTestHandler({ stream }, { retryDelaysMs: [0, 0, 0], ...extra });
const finish = { type: 'finish', reason: { kind: 'stop' } };
let count = 0;
const optionsSeen = [];
const recovery = fixture(async function* (options) {
  const current = ++count; optionsSeen.push(options);
  assert.equal(options.messages.length, 1); assert.equal(options.messages[0].content[0].text, prompt);
  assert.equal(options.reasoningEffort, 'high'); assert.equal(options.tools, undefined); assert.equal(options.sessionId, undefined);
  yield { type: 'reasoning-delta', index: 0, text: 'thought-' + current };
  yield { type: 'text-delta', index: 1, text: current < 4 ? 'partial-' + current + 'x'.repeat(3000) : '<html><svg>final</svg></html>' };
  if (current < 4) throw Object.assign(new Error('private details must not leak'), { code: 'TRANSPORT' });
  yield { ...finish, replayState: { response: { responseId: 'final-id' } } };
});
const result = await (await recovery(request())).json();
assert.equal(count, 4); assert.equal(result.retryCount, 3); assert.equal(result.maxRetries, 3);
assert.equal(result.raw, '<html><svg>final</svg></html>'); assert.equal(result.requestId, 'test-round-one:pelican');
assert.equal(new Set(optionsSeen.map(o => o.intelligenceRequestId)).size, 4);
assert.equal(result.attemptHistory.length, 3);
for (const [i, item] of result.attemptHistory.entries()) {
  assert.equal(item.attempt, i + 1); assert.equal(item.partialRaw, 'partial-' + (i + 1) + 'x'.repeat(3000));
  assert.equal(item.responseBlocks[0].text, 'thought-' + (i + 1)); assert.equal(item.reasoningChars, 9);
  assert.equal(item.attemptHistory, undefined); assert.equal(item.requestId, optionsSeen[i].intelligenceRequestId);
}
assert.ok(!JSON.stringify(result).includes('private details'));
assert.match(result.attemptRequestId, /retry-3$/);

for (const code of ['AUTH', 'INVALID_CREDENTIAL', 'QUOTA', 'QUOTA_EXCEEDED', 'INVALID_REQUEST', 'UNKNOWN_MODEL', 'PROVIDER_DISABLED', 'UNSUPPORTED_REASONING_EFFORT', 'MAX_TOKENS', 'CONTEXT_WINDOW_EXCEEDED']) {
  let n = 0;
  const h = fixture(async function* () { n++; throw Object.assign(new Error('private error'), { code, status: 503 }); });
  const r = await (await h(request())).json(); assert.equal(n, 1, code); assert.equal(r.code, code);
}
for (const code of ['TRANSPORT', 'TIMEOUT', 'LLM_STREAM_IDLE_TIMEOUT', 'STREAM_CLOSED', 'RATE_LIMIT', 'SERVER', 'EMPTY_RESPONSE']) {
  let n = 0;
  const h = fixture(async function* () { n++; yield { type: 'text-delta', index: 0, text: 'part' + n }; yield { type: 'finish', reason: { kind: 'error', failure: { code } } }; });
  const r = await (await h(request())).json(); assert.equal(n, 4, code); assert.equal(r.attemptHistory.length, 3);
  assert.equal(r.partialRaw, 'part4'); assert.match(r.retryStopReason, /重试 3 次/);
}
for (const scenario of ['incomplete', 'empty', 'reasoning-only']) {
  let n = 0;
  const h = fixture(async function* () { n++; if (scenario === 'incomplete') yield { type: 'text-delta', index: 0, text: 'unfinished' }; else { if (scenario === 'reasoning-only') yield { type: 'reasoning-delta', index: 0, text: 'thought' }; yield finish; } });
  const r = await (await h(request())).json(); assert.equal(n, 4, scenario); assert.equal(r.attemptHistory.length, 3);
}
for (const scenario of ['wrong-answer', 'tools', 'length-limit', 'unknown-error', 'http-401']) {
  let n = 0;
  const h = fixture(async function* () {
    n++;
    if (scenario === 'unknown-error') throw new Error('unknown');
    if (scenario === 'http-401') throw Object.assign(new Error('unauthorized'), { status: 401, code: 'SERVER' });
    if (scenario === 'tools') yield { type: 'block-end', index: 0, block: { type: 'tool-call', id: 'call', name: 'exec', arguments: '{}' } };
    else yield { type: 'text-delta', index: 0, text: '29' };
    yield scenario === 'length-limit' ? { type: 'finish', reason: { kind: 'max-tokens' } } : finish;
  });
  const r = await (await h(request())).json(); assert.equal(n, 1, scenario);
  if (scenario === 'length-limit') assert.equal(r.code, 'MAX_TOKENS');
  if (scenario === 'wrong-answer') assert.equal(r.raw, '29');
  if (scenario === 'tools') assert.equal(r.toolCalls[0].name, 'exec');
}
let cancelledCalls = 0;
const abort = new AbortController();
const waiting = fixture(async function* () { cancelledCalls++; throw Object.assign(new Error(), { code: 'TRANSPORT' }); }, { retryDelaysMs: [100, 100, 100] });
const waitingResult = waiting(request(abort.signal)); setTimeout(() => abort.abort(), 10);
const stopped = await (await waitingResult).json();
assert.equal(cancelledCalls, 1); assert.equal(stopped.code, 'CANCELLED'); assert.equal(stopped.attemptHistory.length, 1);
let heldCalls = 0;
const totalDeadline = fixture(async function* ({ signal }) {
  heldCalls++; yield { type: 'text-delta', index: 0, text: 'preserved' };
  await new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error()), { once: true }));
}, { timeoutMs: 25 });
const timed = await (await totalDeadline(request())).json(); assert.equal(timed.code, 'TEST_TIMEOUT'); assert.equal(timed.partialRaw, 'preserved'); assert.equal(heldCalls, 1);
let noBudgetCalls = 0;
const noBudget = fixture(async function* () { noBudgetCalls++; throw Object.assign(new Error(), { code: 'TRANSPORT' }); }, { timeoutMs: 50, retryDelaysMs: [100, 100, 100] });
const noTime = await (await noBudget(request())).json(); assert.equal(noBudgetCalls, 1); assert.match(noTime.retryStopReason, /时限不足/);
let streamCalls = 0;
const streamed = fixture(async function* () { streamCalls++; yield { type: 'text-delta', index: 0, text: streamCalls === 1 ? 'partial-streamed' : '21' }; if (streamCalls === 1) throw Object.assign(new Error(), { code: 'TIMEOUT' }); yield finish; });
const events = (await (await streamed(request(undefined, true))).text()).trim().split('\n').map(JSON.parse);
assert.ok(events.some(e => e.type === 'progress' && e.retrying && e.attemptHistory[0].partialRaw === 'partial-streamed'));
assert.equal(events.at(-1).raw, '21'); assert.equal(events.at(-1).retryCount, 1);
assert.ok(events.some(e => e.type === 'progress' && e.attempt === 2 && e.partialRaw === ''));

// Exercise the actual frontend runner with retrying backend: successful sibling never reruns.
const source = readFileSync(new URL('../src/intelligence/client.js', import.meta.url), 'utf8');
const slice = (a, b) => source.slice(source.indexOf(a), source.indexOf(b, source.indexOf(a)));
const storage = new Map();
const context = vm.createContext({ crypto: webcrypto, AbortController, AbortSignal, TextDecoder, Date,
  window: { setInterval, clearInterval, setTimeout, clearTimeout }, INTELLIGENCE_WORKBENCH_HISTORY_KEY: 'history',
  localStorage: { setItem: (k, v) => storage.set(k, v) }, readIntelligenceWorkbenchHistory: () => [], getIntelligencePrompt: mode => mode });
const code = slice('function intelligenceProgressLabel(', 'function resolveIntelligenceTargetDisplay(') + slice('function intelligenceResultStatus(', 'function buildIntelligenceTimeline(') + slice('function writeIntelligenceWorkbenchHistory(', 'function intelligenceModelKey(') + slice('function prepareIntelligenceSvg(', 'function IntelligenceModelPicker(');
const { createRunner, readResponse, progressLabel } = vm.runInContext(code + ';({createRunner:createIntelligenceRunner,readResponse:readIntelligenceResponse,progressLabel:intelligenceProgressLabel})', context);
let pelican = 0, candy = 0, saves = 0, frontendCalls = 0;
const combined = fixture(async function* (options) {
  if (options.messages[0].content[0].text === 'candy') { candy++; yield { type: 'text-delta', index: 0, text: '29' }; }
  else { pelican++; yield { type: 'reasoning-delta', index: 0, text: 'thinking' }; yield { type: 'text-delta', index: 1, text: pelican < 3 ? 'partial-' + pelican : '<html><svg>final</svg></html>' }; if (pelican < 3) throw Object.assign(new Error(), { code: 'TIMEOUT' }); }
  yield finish;
});
const target = { id: 'one', providerId: 'fixture', modelId: 'fixture' };
const runner = createRunner(async (url, init) => {
  if (url === '/api/intelligence-test') { frontendCalls++; return combined(new Request('http://localhost' + url, init)); }
  saves++; return Response.json({ path: 'fixture-path.html' });
});
const progressSnapshots = [];
runner.subscribe(() => { const q = runner.getSnapshot().progress.one?.questions[0]; if (q?.retrying) progressSnapshots.push(q); });
await runner.run(target); await runner.flushHistory();
const record = runner.getSnapshot().history[0];
assert.equal(frontendCalls, 2); assert.equal(pelican, 3); assert.equal(candy, 1); assert.equal(saves, 1);
assert.equal(record.questions[0].retryCount, 2); assert.equal(record.questions[0].attemptHistory.length, 2);
assert.equal(record.questions[0].raw, '<html><svg>final</svg></html>'); assert.equal(record.questions[0].partialRaw, '');
assert.equal(record.questions[1].answer, 29); assert.equal(record.tone, 'warn'); assert.ok(progressSnapshots.length > 0);
assert.equal(JSON.parse(storage.get('history'))[0].questions[0].attemptHistory[0].partialRaw, 'partial-1');
assert.match(progressLabel({ ...progressSnapshots[0], startedAt: Date.now(), timeoutMinutes: 10 }), /自动重试 1\/3/);
runner.dispose();
// Browser stream EOF retains the last checkpoint and never blindly creates a second paid job.
const disconnected = createRunner(async (url, init) => {
  const { mode } = JSON.parse(init.body);
  if (mode === 'candy') return Response.json({ ...JSON.parse(init.body), raw: '21' });
  return new Response(JSON.stringify({ type: 'progress', textChars: 3000, partialRaw: 'x'.repeat(3000), responseBlocks: [{ type: 'reasoning', text: 'saved thoughts' }], attempt: 2, retryCount: 1, attemptHistory: [{ attempt: 1, partialRaw: 'first' }] }) + '\n', { headers: { 'content-type': 'application/x-ndjson' } });
});
await disconnected.run(target); const dropped = disconnected.getSnapshot().history[0].questions[0];
assert.equal(dropped.completed, false); assert.equal(dropped.partialRaw.length, 3000); assert.equal(dropped.responseBlocks[0].text, 'saved thoughts'); assert.equal(dropped.attemptHistory[0].partialRaw, 'first');
disconnected.dispose();
console.log('PASS: 3 retries (4 attempts), immutable per-attempt content, unique trace IDs, exact prompts, sibling isolation, wrong answers not retried, auth/quota/token-limit excluded, abort/backoff/deadline, streaming retry updates, persisted attempts and dropped-browser checkpoint retention. No paid calls.');
