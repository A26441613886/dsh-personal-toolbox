import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { apply, Config } from '../compat/routing/pi-ai.js';
import { createIntelligenceTestHandler } from '../src/shared/services.js';

// Local HTTP provider: exercise the actual SDK/adapter wire, never real credentials.
const received = [];
const server = createServer(async (req, res) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  const body = JSON.parse(raw);
  received.push({ path: req.url, headers: req.headers, body });
  if (body.model === 'network-failure') { req.socket.destroy(); return; }
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'x-request-id': 'fixture-http-' + received.length, 'x-cache': 'HIT', 'age': '12', 'set-cookie': 'secret-cookie-value', 'x-secret': 'private-metadata' });
  if (req.url === '/v1/responses') {
    const response = { id: 'fixture-responses-id', object: 'response', status: 'completed', model: body.model, output: [{ id: 'msg-local', type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: '21', annotations: [] }] }], usage: { input_tokens: 5, output_tokens: 1, total_tokens: 6 } };
    for (const event of [
      { type: 'response.created', response: { ...response, status: 'in_progress', output: [] } },
      { type: 'response.output_item.added', output_index: 0, item: { ...response.output[0], status: 'in_progress', content: [] } },
      { type: 'response.content_part.added', item_id: 'msg-local', output_index: 0, content_index: 0, part: { type: 'output_text', text: '', annotations: [] } },
      { type: 'response.output_text.delta', item_id: 'msg-local', output_index: 0, content_index: 0, delta: '21' },
      { type: 'response.output_item.done', output_index: 0, item: response.output[0] },
      { type: 'response.completed', response }
    ]) res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
    res.end(); return;
  }
  if (req.url.startsWith('/v1/messages')) {
    for (const event of [
      { type: 'message_start', message: { id: 'fixture-anthropic-id', type: 'message', role: 'assistant', model: body.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 5, output_tokens: 0 } } },
      { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: '21' } },
      { type: 'content_block_stop', index: 0 },
      { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 1 } },
      { type: 'message_stop' }
    ]) res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
    res.end(); return;
  }
  const chunk = { id: 'fixture-repeated-upstream-id', object: 'chat.completion.chunk', created: 1700000000, model: body.model };
  res.write(`data: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: { role: 'assistant', content: '21' }, finish_reason: null }] })}\n\n`);
  res.end(`data: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] })}\n\ndata: [DONE]\n\n`);
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
try {
  let adapter;
  const secrets = { PRIMARY: 'local-fixture-primary', BACKUP: 'local-fixture-backup' };
  apply({
    get: name => name === 'credentials' ? { resolve: async ref => ({ value: secrets[ref] }) } : undefined,
    logger: { warn() {}, error() {} }, inject() {}, fiber: {}, on() {},
    llm: {
      registerConfigurableProviders: () => ({ replace() {} }), registerModelDiscovery() {},
      registerAdapter(_ids, value) { adapter = value; return { replace() {} }; }
    }
  }, Config({ providers: { fixture: {
    api: 'openai-completions', baseURL: `http://127.0.0.1:${server.address().port}/v1`,
    headers: { 'cache-control': 'max-age=9999', pragma: 'configured-value', 'x-client-request-id': 'configured-id' },
    apiKeys: [{ id: 'primary', name: 'Primary', credentialRef: 'PRIMARY' }, { id: 'backup', name: 'Backup', credentialRef: 'BACKUP' }], activeApiKey: 'primary',
    models: [{ id: 'network-failure', contextWindow: 8192, maxTokens: 1024 }, { id: 'demo', apiKey: 'primary', contextWindow: 8192, maxTokens: 1024 }, { id: 'demo#backup', upstreamModelId: 'demo', apiKey: 'backup', contextWindow: 8192, maxTokens: 1024 }]
  },
    'fixture-responses': { api: 'openai-responses', baseURL: `http://127.0.0.1:${server.address().port}/v1`, apiKeys: [{ id: 'primary', name: 'Fixture', credentialRef: 'PRIMARY' }], activeApiKey: 'primary', models: [{ id: 'demo', contextWindow: 8192, maxTokens: 1024 }] },
    'fixture-anthropic': { api: 'anthropic-messages', baseURL: `http://127.0.0.1:${server.address().port}`, apiKeys: [{ id: 'primary', name: 'Fixture', credentialRef: 'PRIMARY' }], activeApiKey: 'primary', models: [{ id: 'demo', contextWindow: 8192, maxTokens: 1024 }] }
  } }));
  const handler = createIntelligenceTestHandler(adapter, { retryDelaysMs: [0, 0, 0] });
  const prompt = '原始题目内容，保持不变。';
  for (const model of ['demo', 'demo#backup']) {
    const requestId = `fixture-round-${model === 'demo' ? 'primary' : 'backup'}`;
    const response = await handler(new Request('http://localhost/api/intelligence-test', { method: 'POST', body: JSON.stringify({ requestId, provider: 'fixture', model, mode: 'candy', prompt, reasoningEffort: 'off' }) }));
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.requestId, requestId);
    assert.equal(result.provider, 'fixture'); assert.equal(result.model, model);
    assert.equal(result.upstreamResponseId, 'fixture-repeated-upstream-id');
    assert.equal(result.raw, '21');
    assert.equal(result.transport.observed, true);
    assert.equal(result.transport.attempts, 1);
    assert.equal(result.transport.responses, 1);
    assert.equal(result.transport.status, 200);
    assert.equal(result.transport.headers['x-request-id'], 'fixture-http-' + received.length);
    assert.equal(result.transport.headers['x-cache'], 'HIT');
    assert.equal(result.transport.headers.age, '12');
    assert.equal(result.transport.headers['set-cookie'], undefined);
    assert.equal(result.transport.headers['x-secret'], undefined);
    assert.ok(result.transport.headersMs >= 0);
    assert.ok(result.firstChunkMs >= 0);
    assert.equal(result.rawSha256, createHash('sha256').update('21').digest('hex'));
    assert.ok(!JSON.stringify(result).includes('secret-cookie-value'));
    assert.ok(result.serverStartedAt <= result.upstreamStartedAt);
    const call = received.at(-1);
    assert.equal(call.path, '/v1/chat/completions');
    assert.equal(call.body.model, 'demo', 'Local alias never leaks to upstream');
    assert.deepEqual(call.body.messages, [{ role: 'user', content: prompt }]);
    assert.equal(call.body.tools, undefined);
    assert.equal(call.headers.authorization, `Bearer ${model === 'demo' ? secrets.PRIMARY : secrets.BACKUP}`);
    assert.equal(call.headers['cache-control'], 'no-cache, no-store');
    assert.equal(call.headers.pragma, 'no-cache');
    assert.equal(call.headers['x-client-request-id'], requestId);
  }
  assert.equal(received.length, 2, 'Every test sent its own real HTTP request');
  for await (const _chunk of adapter.stream({ provider: 'fixture', model: 'demo', messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }], reasoningEffort: 'off' })) { /* normal chat */ }
  assert.equal(received.at(-1).headers['cache-control'], 'max-age=9999', 'Normal chat header configuration stays intact');
  assert.equal(received.at(-1).headers['x-client-request-id'], 'configured-id');
  const invalid = await handler(new Request('http://localhost/api/intelligence-test', { method: 'POST', body: JSON.stringify({ provider: 'fixture', model: 'demo', mode: 'candy', prompt, requestId: 'bad\r\nheader' }) }));
  assert.equal(invalid.status, 400); assert.equal(received.length, 3);
  for (const provider of ['fixture-responses', 'fixture-anthropic']) {
    const response = await handler(new Request('http://localhost/api/intelligence-test', { method: 'POST', body: JSON.stringify({ requestId: 'round-' + provider, provider, model: 'demo', mode: 'candy', prompt, reasoningEffort: 'off' }) }));
    const result = await response.json();
    assert.equal(response.status, 200, JSON.stringify(result));
    assert.equal(result.raw, '21');
    assert.equal(result.transport.attempts, 1);
    assert.equal(result.transport.responses, 1);
    assert.equal(result.transport.headers['x-cache'], 'HIT');
    assert.equal(result.transport.headers['set-cookie'], undefined);
  }
  const failed = await handler(new Request('http://localhost/api/intelligence-test', { method: 'POST', body: JSON.stringify({ requestId: 'round-network-failure', provider: 'fixture', model: 'network-failure', mode: 'candy', prompt, reasoningEffort: 'off' }) }));
  const failedBody = await failed.json();
  assert.equal(failed.status, 502);
  assert.equal(failedBody.transport.attempts, 1);
  assert.equal(failedBody.transport.responses, 0);
  assert.equal(failedBody.transport.failures, 1);
  assert.equal(failedBody.retryCount, 3);
  assert.equal(failedBody.attemptHistory.length, 3);
  assert.equal(received.filter(call => call.body.model === 'network-failure').length, 4);
  assert.equal(new Set(received.filter(call => call.body.model === 'network-failure').map(call => call.headers['x-client-request-id'])).size, 4);
  assert.ok(failedBody.attemptHistory.every(item => item.transport.attempts === 1 && item.transport.responses === 0));
  assert.ok(!JSON.stringify(failedBody).includes('local-fixture-primary'));
  console.log('PASS: actual local HTTP requests, original prompts, separate key routing, upstream model alias, diagnostic cache headers, real HTTP evidence, safe response headers, full-body SHA-256, response IDs, normal chat isolation, invalid ID rejection.');
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
