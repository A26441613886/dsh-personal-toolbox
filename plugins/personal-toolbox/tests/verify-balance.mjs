import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';
import { mkdtemp, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { applyBalanceSample, createBalanceService, createQueryEditor, validateQuery, parseBalance, selectRecipe, spendFromReadings, summarizeHistory } from '../src/shared/services.js';
const historyFile = join(await mkdtemp(join(tmpdir(), 'dsh-balance-history-')), 'balance-history.json');

const baseURL = 'https://balance.example/v1';
const usage = { enabled: true, templateType: 'newapi', baseUrl: 'https://balance.example', accessToken: 'query-secret', userId: '2', autoQueryInterval: 5, code: 'remaining: response.data.quota / 500000, unit: "元"' };
const providers = [{ apiKey: 'key-a', baseURL, usage }];
const recipe = selectRecipe(baseURL, 'key-a', providers);
assert.equal(recipe.type, 'newapi');
assert.equal(selectRecipe(baseURL, 'key-b', providers), null);
assert.equal(selectRecipe('https://gateway-alias.example', 'key-a', providers).url, 'https://balance.example/api/user/self');
assert.equal(selectRecipe(baseURL, 'key-a', [{ ...providers[0], usage: { ...usage, baseUrl: 'http://different.example' } }]), null);
assert.equal(selectRecipe('https://alias.example', 'key-a', [...providers, { ...providers[0], usage: { ...usage, accessToken: 'different-account' } }]), null);
assert.equal(selectRecipe(baseURL, 'key-a', [{ ...providers[0], usage: { ...usage, code: 'arbitrary script' } }]), null);
assert.deepEqual(parseBalance({ success: true, data: { quota: 6115000, used_quota: 34440000 } }, recipe), [{ used: 68.88, remaining: 12.23, unit: '元' }]);
assert.throws(() => parseBalance({ success: true, data: { quota: null, used_quota: 0 } }, recipe));
assert.throws(() => parseBalance({ remaining: false, unit: 'USD' }, { type: 'general' }));
assert.deepEqual(parseBalance({ balance_infos: [{ total_balance: '12.23', currency: 'CNY' }] }, { type: 'deepseek' }), [{ used: null, remaining: 12.23, unit: 'CNY' }]);
assert.deepEqual(parseBalance({ remaining: 0, used: 0, unit: 'USD' }, { type: 'general' }), [{ remaining: 0, used: 0, unit: 'USD' }]);
assert.equal(spendFromReadings({ used: 10, remaining: 90, unit: '元' }, { used: 12.5, remaining: 87.5, unit: '元' }), 2.5);
assert.equal(spendFromReadings({ used: null, remaining: 12.23, unit: 'CNY' }, { used: null, remaining: 10, unit: 'CNY' }), 2.23);
assert.equal(spendFromReadings({ used: 10, remaining: 5, unit: 'USD' }, { used: 8, remaining: 20, unit: 'USD' }), 0);
const sampled = applyBalanceSample({ last: { readings: [{ used: 10, remaining: 90, unit: '元' }] }, days: {} }, [{ used: 12, remaining: 88, unit: '元' }], Date.now());
assert.equal(Object.values(sampled.days)[0]['元'], 2);
assert.equal(summarizeHistory(sampled).today[0].spend, 2);

const profile = { baseURL, apiKeys: [{ id: 'a', credentialRef: 'KEY_A' }, { id: 'b', credentialRef: 'KEY_B' }], activeApiKey: 'a' };
let calls = 0;
const service = createBalanceService({
  settings: { get: () => ({ providers: { example: profile } }) },
  credentials: { resolve: async ref => ({ value: ref === 'KEY_A' ? 'key-a' : 'key-b' }) },
  historyFile,
  readProviders: async () => providers,
  fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, 'https://balance.example/api/user/self');
    assert.equal(options.headers.Authorization, 'Bearer query-secret');
    assert.equal(options.redirect, 'error');
    await new Promise(resolve => setTimeout(resolve, 20));
    return Response.json({ success: true, data: { quota: 6115000, used_quota: 34440000 } });
  }
});
const results = await Promise.all([service('example', 'a'), service('example', 'a')]);
assert.equal(calls, 1, 'concurrent refreshes share one request');
assert.equal(results[0].balances[0].remaining, 12.23);
assert.ok(!JSON.stringify(results).includes('secret'));
await service('example', 'a', true);
assert.equal(calls, 1, 'rapid refresh is throttled');
profile.activeApiKey = 'b';
assert.equal((await service('example', 'a')).reason, 'changed');
assert.equal((await service('example', 'b')).reason, 'setup');
assert.equal((await service('__proto__', 'a')).reason, 'provider');
console.log('PASS: quota conversion, missing/zero amounts, credential matching, origin matching, stale key, cache, concurrent refresh and secret redaction.');

const records = new Map();
const editorCredentials = {
  resolve: async ref => ({ value: ref === 'KEY_A' ? 'key-a' : 'key-b' }),
  readRecord: async id => records.get(id),
  describeRecord: async () => ({ writable: true }),
  modifyRecord: async (id, fn) => { const value = await fn(records.get(id)); records.set(id, value); return value; }
};
const editorSettings = { get: () => ({ providers: { example: profile } }) };
const custom = { type: 'custom', url: 'https://balance.example/balance', auth: 'custom', interval: 300, divisor: 100, unit: 'USD', scope: 'account', remainingPath: 'data.money', usedPath: 'data.spent' };
let editorCalls = 0;
const editorFetch = async (url, options) => {
  editorCalls++; assert.equal(options.headers.Authorization, 'Bearer private-query-token');
  return Response.json({ data: { money: 1234, spent: 100 } });
};
const editor = createQueryEditor({ settings: editorSettings, credentials: editorCredentials, readProviders: async () => providers, fetchImpl: editorFetch, historyFile });
assert.throws(() => validateQuery({ ...custom, url: 'http://example.com' }));
assert.throws(() => validateQuery({ ...custom, remainingPath: '__proto__.value' }));
assert.throws(() => validateQuery({ ...custom, interval: 0 }));
assert.throws(() => validateQuery({ ...custom, divisor: 0 }));
assert.equal((await editor('example', 'b')).revision, 0);
const testOnly = await editor('example', 'b', 'test', { config: custom, token: 'private-query-token' });
assert.equal(testOnly.balances[0].remaining, 12.34);
assert.ok(testOnly.history, 'successful test persists its balance sample');
assert.equal(records.size, 0, 'test must not save settings');
await editor('example', 'b', 'save', { config: custom, token: 'private-query-token', revision: 0 });
const loadedQuery = await editor('example', 'b');
assert.equal(loadedQuery.tokenConfigured, true);
assert.ok(!JSON.stringify(loadedQuery).includes('private-query-token'));
await editor('example', 'b', 'save', { config: custom, token: '', revision: 1 });
await assert.rejects(() => editor('example', 'b', 'save', { config: custom, revision: 1 }), /已被修改/);
await assert.rejects(() => editor('example', 'b', 'save', { config: { ...custom, url: 'https://different.example' }, revision: 2 }), /查询凭证/);
assert.equal((await editor('example', 'a')).config.type, 'auto', 'key settings stay isolated');
const savedBalance = createBalanceService({ settings: editorSettings, credentials: editorCredentials, readProviders: async () => [], fetchImpl: editorFetch, historyFile });
assert.equal((await savedBalance('example', 'b')).balances[0].remaining, 12.34);
assert.equal(editorCalls, 2);
await editor('example', 'b', 'save', { config: { type: 'off' }, revision: 2 });
assert.equal((await savedBalance('example', 'b')).reason, 'disabled');
await editor('example', 'b', 'save', { config: { type: 'auto' }, revision: 3 });
assert.equal((await editor('example', 'b')).config.type, 'auto');
console.log('PASS: editable query save/load, test persists history without saving settings, secret retention/redaction, changed URL protection, conflict handling, independent keys, custom JSON conversion, disable/reset.');

if (process.argv.includes('--live')) {
  // Read only; output contains monetary results, never credential values.
  const root = process.env.DSH_HOME || join(homedir(), '.dsh');
  const settings = parse(readFileSync(join(root, 'settings.yaml'), 'utf8'));
  const credentials = parse(readFileSync(join(root, '.credentials.yaml'), 'utf8'));
  const live = createBalanceService({ settings: { get: ns => settings[ns] }, credentials: { resolve: async ref => ({ value: process.env[ref] ?? credentials.refs?.[ref] }) }, historyFile });
  const profiles = [['deepseek-official', settings['llm-deepseek']], ...Object.entries(settings['llm-pi-ai']?.providers ?? {})];
  for (const [provider, profile] of profiles) {
    if (!profile) continue;
    const key = profile.apiKeys?.find(k => k.id === profile.activeApiKey) ?? profile.apiKeys?.[0];
    console.log(JSON.stringify({ provider, result: await live(provider, key?.id ?? 'legacy-default') }));
  }
}

await rm(dirname(historyFile), { recursive: true, force: true });
