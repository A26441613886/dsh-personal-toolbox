import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import YAML from 'yaml';
import { resolveRetryPolicy, isQuotaExceededError, QUOTA_EXCEEDED_CODE } from '@deepseek-ai/dsh-llm';
import { apply } from '@deepseek-ai/dsh-llm-retry';

// Exercise the patched classifier and the installed recovery plugin without
// making paid model calls or modifying any session on disk.
const source = fs.readFileSync(new URL('../compat/routing/pi-ai.js', import.meta.url), 'utf8');
const classifier = source.match(/function classifyPiAiError\(message\) \{[\s\S]*?\n\}/)?.[0];
assert.ok(classifier);
const classify = vm.runInNewContext(`(${classifier})`, { isQuotaExceededError, QUOTA_EXCEEDED_CODE });
assert.equal(classify('Our servers are currently overloaded. Please try again later.'), 'SERVER');
assert.equal(classify('401 Invalid API key. Please try again later.'), 'AUTH');
assert.equal(classify('400 invalid request'), 'INVALID_REQUEST');
assert.equal(classify('cannot modify file: file has not been read'), 'PI_AI_ERROR');

// Isolated policy fixture; user retry choices are not test inputs.
const policy = resolveRetryPolicy({ mode: 'normal', maxRetries: 3, backoff: { initialDelayMs: 2000 }, retryableCodes: ['SERVER','RATE_LIMIT','TIMEOUT','TRANSPORT'] }, 'test.retryPolicy');
let projection, recover, dispose;
let state = {};
const events = [];
const ctx = {
  sessionProjections: {
    register(p) { projection = p; state = p.init(); },
    stateOf() { return state; }
  },
  on(name, handler) { assert.equal(name, 'agent/request-error'); recover = handler; return () => {}; },
  effect(factory) { dispose = factory(); }
};
apply(ctx, {}, { random: () => 0.5 });
const agent = { session: { append(type, data) {
  const event = { type, data };
  events.push(event);
  state = projection.apply(state, event);
} } };
const payload = {
  agent, turn: 1, step: 1, provider: 'mock', retryPolicy: policy,
  failure: { code: classify('Our servers are currently overloaded. Please try again later.'), message: 'mock overload' },
  signal: new AbortController().signal
};
const next = async () => undefined;
for (let retry = 1; retry <= 3; retry++) assert.deepEqual(await recover(payload, next), { kind: 'retry' });
assert.equal(await recover(payload, next), undefined);
assert.deepEqual(events.filter(e => e.type === 'llm/retry').map(e => [e.data.retry, e.data.delayMs]), [[1, 2000], [2, 4000], [3, 8000]]);
state = projection.apply(state, { type: 'step/start' });
assert.equal(await recover({ ...payload, failure: { code: 'AUTH', message: 'bad key' } }, next), undefined);
const controller = new AbortController();
const pending = recover({ ...payload, signal: controller.signal }, next);
controller.abort();
assert.equal(await pending, undefined);
assert.equal(events.filter(e => e.type === 'llm/retry-started').length, 3);
await dispose();
console.log('PASS: overload classification, provider policies, 3 retries at 2/4/8 seconds, retry limit, permanent errors, cancellation');
