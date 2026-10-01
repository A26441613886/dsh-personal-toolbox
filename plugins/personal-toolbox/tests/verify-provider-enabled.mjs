import assert from 'node:assert/strict';
import { apply, Config } from '../compat/routing/pi-ai.js';
import { createIntelligenceTestHandler } from '../src/shared/services.js';

// Exercise real configuration, registration and request boundaries without network calls or user settings.
const fixture = { displayName: 'Fixture provider', api: 'openai-completions', baseURL: 'https://example.invalid/v1',
  apiKeys: [{ id: 'test', name: 'Fixture key', credentialRef: 'FIXTURE_API_KEY' }], activeApiKey: 'test',
  models: [
    { id: 'demo', name: 'Demo', apiKey: 'test', contextWindow: 8192, maxTokens: 1024 },
    { id: 'demo#backup', name: 'Demo', upstreamModelId: 'demo', apiKey: 'backup', contextWindow: 8192, maxTokens: 1024 }
  ] };
let config = Config({ providers: { fixture, other: { ...fixture, displayName: 'Other provider' } } });
assert.equal(config.providers.get().fixture.enabled, true);
assert.throws(() => Config({ providers: { fixture: { ...fixture, enabled: 'false' } } }));
let adapter, settings, directory, routes, invalidations = 0;
const hooks = {};
const ctx = {
  fiber: {}, on(name, handler) { hooks[name] = handler; },
  get() { throw Error('Credentials or external services must not be accessed'); },
  logger: { warn() {}, error(error) { throw error; } },
  llm: {
    registerConfigurableProviders(entries) { directory = entries; return { replace(next) { directory = next; } }; },
    registerModelDiscovery() {},
    registerAdapter(ids, value) { routes = ids; adapter = value; return { replace(next) { routes = next; invalidations++; } }; }
  },
  inject(deps, callback) {
    // Settings UI injection is not needed for this adapter contract test.
  }
};
const liveConfig = { providers: { get: () => config.providers.get() } };
apply(ctx, liveConfig);
const original = structuredClone(config.providers.get());
assert.equal((await adapter.listModels('fixture')).length, 2);
assert.equal((await adapter.resolveModel('fixture', 'demo')).name, 'Demo');
assert.equal((await adapter.resolveModel('fixture', 'demo#backup')).id, 'demo#backup');
assert.equal(adapter.current().models.getModel('fixture', 'demo#backup').upstreamModelId, 'demo');
const oldSnapshot = adapter.current();
function save(enabled) {
  const next = { providers: { ...config.providers.get(), fixture: { ...config.providers.get().fixture, enabled } } };
  hooks['internal/config'].call(ctx.fiber, null, () => next);
  config = Config(next);
  hooks['loader/volatile-update']();
}
save(false);
assert.equal(invalidations, 1, 'catalog is invalidated on toggle');
assert.ok(routes.includes('fixture'), 'route ownership prevents fallback to another adapter');
assert.ok(directory.some(entry => entry.provider === 'fixture'), 'disabled provider stays editable');
assert.deepEqual(await adapter.listModels('fixture'), []);
assert.equal((await adapter.listModels('other')).length, 2);
await assert.rejects(adapter.resolveModel('fixture', 'demo'), { code: 'PROVIDER_DISABLED' });
await assert.rejects(adapter.stream({ provider: 'fixture', model: 'demo', messages: [] }).next(), { code: 'PROVIDER_DISABLED' });
await assert.rejects(adapter.streamWithSnapshot({ provider: 'fixture', model: 'demo', messages: [] }, oldSnapshot).next(), { code: 'PROVIDER_DISABLED' });
const handler = createIntelligenceTestHandler(adapter);
const response = await handler(new Request('http://localhost/api/intelligence-test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ provider: 'fixture', model: 'demo', mode: 'candy', prompt: 'fixture' }) }));
assert.equal(response.status, 409);
const result = await response.json();
assert.equal(result.code, 'PROVIDER_DISABLED');
assert.match(result.error, /供应商已停用/);
save(true);
assert.equal(invalidations, 2);
assert.deepEqual(config.providers.get(), original, 're-enabling retains all models, key references and settings');
assert.equal((await adapter.listModels('fixture')).length, 2);
assert.equal((await adapter.resolveModel('fixture', 'demo')).name, 'Demo');
console.log('PASS: legacy default, schema, persistence, catalog invalidation, retained directory, request blocking including old snapshots and tests, unaffected other provider, re-enable without data loss');
