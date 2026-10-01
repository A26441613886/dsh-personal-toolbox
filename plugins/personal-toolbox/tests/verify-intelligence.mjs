import assert from 'node:assert/strict';
import { createIntelligenceTestHandler } from '../src/shared/services.js';

const calls = [];
const llm = {
  async *stream(options) {
    calls.push(options);
    await new Promise(resolve => setTimeout(resolve, options.model === 'slow' ? 25 : 2));
    yield { type: 'text-delta', index: 0, text: options.model === 'slow' ? '<svg>' : '21' };
    yield { type: 'block-end', index: 0, block: { type: 'text', text: options.model === 'slow' ? '<svg>pelican</svg>' : '21' } };
    yield { type: 'finish', reason: { kind: 'stop' } };
  }
};
const handler = createIntelligenceTestHandler(llm, { timeoutMs: 1000 });
const request = (model, mode = 'candy') => new Request('http://localhost/api/intelligence-test', {
  method: 'POST', body: JSON.stringify({ provider: 'example', model, mode, prompt: 'test' }), headers: { 'content-type': 'application/json' }
});
const [one, two] = await Promise.all([handler(request('fast')), handler(request('slow', 'pelican'))]);
assert.equal((await one.json()).raw, '21');
assert.equal((await two.json()).raw, '<svg>pelican</svg>');
assert.equal(calls.length, 2);
assert.ok(calls.every(call => !('sessionId' in call) && !('tools' in call) && !('system' in call)));
assert.equal(calls[0].messages[0].source.kind, 'user');
const invalid = await handler(new Request('http://localhost/api/intelligence-test', { method: 'POST', body: '{}' }));
assert.equal(invalid.status, 400);
const timeoutHandler = createIntelligenceTestHandler({
  async *stream({ signal }) {
    await new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    });
  }
}, { timeoutMs: 10 });
const timed = await timeoutHandler(request('never'));
assert.equal(timed.status, 504);
console.log('PASS: independent concurrent requests, isolated messages, block assembly, and validation.');
