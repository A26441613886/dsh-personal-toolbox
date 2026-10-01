import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { openSpendingStore, usageIdentity, observeSpending, applySpending, dayOf } from '../src/spending/host.js';
import { backupSpending } from '../tools/backup-spending.mjs';

const directory = mkdtempSync(join(tmpdir(), 'dsh-spending-test-'));
const file = join(directory, 'ledger.sqlite');
const settings = { get: ns => ns === 'llm-pi-ai' ? { providers: { p: { displayName: '供应商', activeApiKey: 'a', apiKeys: [{ id: 'a', name: '主线路' }, { id: 'b', name: '副线路' }], models: [{ id: 'model-b', apiKey: 'b' }] } } } : { apiKeyEnv: 'REF-B', activeApiKey: 'a', apiKeys: [{ id: 'a', credentialRef: 'REF-A' }, { id: 'b', credentialRef: 'REF-B' }] } };
const identity = usageIdentity(settings, { provider: 'p', model: 'model-b', intelligenceRequestId: 'test' });
assert.equal(identity.key, 'b');
assert.equal(identity.source, 'intelligence');
assert.equal(usageIdentity(settings, { provider: 'deepseek-official', model: 'deepseek-chat' }).key, 'b');
let store = openSpendingStore(file);
const chunks = [{ type: 'text', text: 'unchanged' }, { type: 'usage', usage: { inputTokens: 10, outputTokens: 2 } }, { type: 'usage', usage: { inputTokens: 30, outputTokens: 8, cacheReadTokens: 5 } }, { type: 'finish', reason: { kind: 'stop' } }];
const output = [];
for await (const c of observeSpending(async function* () { yield* chunks; }, identity, (...args) => store.record(...args))) output.push(c);
assert.deepEqual(output, chunks);
assert.equal(store.snapshot().rows[0].input, 30, 'usage snapshots are not double counted');
await assert.rejects(async () => { for await (const c of observeSpending(async function* () { throw Error('upstream'); }, identity, (...args) => store.record(...args))) {} }, /upstream/);
assert.equal(store.snapshot().rows[0].missing, 1);
assert.equal(store.snapshot().rows[0].failures, 1);
store.record({ ...identity, key: 'a' }, { inputTokens: 200, outputTokens: 5 }, false, new Date(2020, 0, 1).getTime());
store.price({ provider: 'p', model: 'model-b', key_id: 'b', unit: '元', input: 2, output: 8, cache_read: 1, cache_write: 0 });
assert.throws(() => store.price({ provider: 'p', model: 'model-b', key_id: 'b', unit: '元', input: '', output: 8, cache_read: 1, cache_write: 0 }));
store.selectKey('p', 'b');
const backupFile = join(directory, 'backup.sqlite');
await backupSpending(file, backupFile);
const backedUp = openSpendingStore(backupFile);
assert.equal(backedUp.snapshot().rows.length, 2, 'online backup includes live WAL records');
backedUp.close();
await assert.rejects(backupSpending(file, backupFile), /already exists/);
store.close();
store = openSpendingStore(file);
assert.equal(store.snapshot().rows.length, 2);
assert.equal(store.snapshot().prices.length, 1);
assert.equal(store.snapshot().preferences[0].key_id, 'b');
store.close();
const corrupt = join(directory, 'broken.sqlite');
writeFileSync(corrupt, 'not a database');
assert.throws(() => openSpendingStore(corrupt));
assert.equal(readFileSync(corrupt, 'utf8'), 'not a database');

let hook, route;
const disposals = [], queries = [];
applySpending({ settings, on: (_, fn) => { hook = fn; }, effect: fn => disposals.push(fn()), connection: { fetch: { register: r => { route = r.fetch; } } } }, {
  sampleInterval: 0, file, historyFile: join(directory, 'absent.json'), balance: async (p, k) => { queries.push([p,k]); return { status: 'ok', balances: [] }; }
});
const api = body => route(new Request('http://localhost/api/personal-spending', body ? { method: 'POST', body: JSON.stringify(body) } : {}));
let result = await (await api()).json();
assert.equal(result.rows.length, 2);
assert.ok(!JSON.stringify(result).includes('REF-B'), 'no credential references exposed');
await api({ action: 'refresh' });
assert.deepEqual(queries[0], ['p','b']);
await api({ action: 'key', provider: 'p', key: '__exclude__' });
queries.length = 0;
await api({ action: 'refresh' });
assert.ok(!queries.some(q => q[0] === 'p'));
assert.equal((await api({ action: 'key', provider: 'p', key: 'unknown' })).status, 400);
for await (const chunk of hook({ provider: 'p', model: 'model-b' }, async function* () { yield* chunks; })) {}
disposals.forEach(fn => fn());
assert.equal((await api()).status, 503);

const source = readFileSync(new URL('../src/spending/client.js', import.meta.url), 'utf8');
const begin = source.indexOf('    const money ='), end = source.indexOf('    const section =');
const viewApi = vm.runInNewContext(source.slice(begin,end) + ';({spendingView})');
const today = dayOf();
const fixture = { today, rows: [], prices: [], preferences: [], providers: [{ id:'p', name:'P', keys:[{id:'a'}], defaultKey:'a' }, { id:'q', name:'Q', keys:[{id:'a'}], defaultKey:'a' }], ledger: { 'p\ta':{ days:{[today]:{元:12,USD:2}} }, 'q\ta':{ days:{[today]:{元:3}} } } };
let view = viewApi.spendingView(fixture, 7, 'actual');
assert.equal(view.totals.get('元'), 17, 'overview folds USD, CNY and yuan labels into one renminbi total');
assert.equal(view.totals.has('USD'), false, 'overview no longer keeps a separate USD series');
fixture.preferences = [{provider:'p',key_id:'__exclude__'}];
assert.equal(viewApi.spendingView(fixture,7,'actual').totals.get('元'),3);
fixture.rows = [{ day: today, provider:'p',model:'m',key_id:'a',calls:1,missing:1,input:0,output:0,cache_read:0,cache_write:0 }];
fixture.prices = [{provider:'p',model:'m',key_id:'a',unit:'元',input:2,output:8,cache_read:1,cache_write:0}];
assert.equal(viewApi.spendingView(fixture,7,'estimate').lines[0].models[0].estimate,null,'missing usage must not appear as free');
Object.assign(fixture.rows[0],{missing:0,input:100000,output:16000,cache_read:20000});
assert.equal(viewApi.spendingView(fixture,7,'estimate').lines[0].models[0].estimate,.348);
// 界面改版新增的逐日趋势与今日对比必须仍然遵守币种隔离和无用量不免费。
const yesterday = dayOf(Date.now() - 86400000);
const chart = {
  today,
  rows: [
    { day: today, provider: 'p', model: 'm', key_id: 'a', source: 'chat', calls: 2, missing: 0, input: 1000000, output: 0, cache_read: 0, cache_write: 0 },
    { day: yesterday, provider: 'p', model: 'm', key_id: 'a', source: 'chat', calls: 1, missing: 0, input: 500000, output: 0, cache_read: 0, cache_write: 0 }
  ],
  prices: [{ provider: 'p', model: 'm', key_id: 'a', unit: '元', input: 2, output: 8, cache_read: 1, cache_write: 0 }],
  preferences: [],
  providers: [
    { id: 'p', name: 'P', keys: [{ id: 'a' }], defaultKey: 'a', requestKey: 'a' },
    { id: 'q', name: 'Q', keys: [{ id: 'a' }], defaultKey: 'a', requestKey: 'a' },
    { id: 'r', name: 'R', keys: [{ id: 'a' }], defaultKey: 'a', requestKey: 'a' }
  ],
  ledger: {},
  startedAt: Date.now()
};
const estimateChart = viewApi.spendingView(chart, 7, 'estimate');
assert.equal(estimateChart.series.length, 1, 'estimate chart groups by currency');
assert.equal(estimateChart.series[0].unit, '元');
// 跨 vm realm 的数组原型不同，deepStrictEqual 会误报，因此按标量比较。
assert.equal(estimateChart.series[0].points.map(point => point.value).join(','), '1,2', 'one bar per day, oldest day first');
assert.equal(estimateChart.series[0].max, 2, 'chart peak drives bar scaling');
assert.equal(estimateChart.deltas.length, 0, 'no balance reading means no misleading delta');
const chartWithLedger = { ...chart, ledger: { 'p\ta': { days: { [today]: { 元: 5, USD: 1 }, [yesterday]: { 元: 3, USD: 4 } } } } };
const actualChart = viewApi.spendingView(chartWithLedger, 7, 'actual');
assert.equal(actualChart.series.map(entry => entry.unit).join(','), '元', 'overview shows one renminbi series');
const yuan = actualChart.series.find(entry => entry.unit === '元');
assert.equal(yuan.points.filter(point => point.date === today).length, 1, 'one day is one bar, not one bar per provider');
assert.equal(yuan.points.at(-1).dayTotal, 6, 'a bar is the whole day total across providers');
assert.equal(actualChart.deltas.map(item => `${item.unit}:${item.change}:${Math.round((item.ratio ?? 0) * 100)}`).join(' '), '元:-1:-14', 'today is compared with the previous day in renminbi');
chartWithLedger.preferences = [{ provider: 'p', key_id: '__exclude__' }];
assert.equal(viewApi.spendingView(chartWithLedger, 7, 'actual').series.length, 0, 'excluded providers stay out of the chart');
let spendingClient, balanceClient;
const loader = target => ({ window: { __ModuleLoader__: { load: ({ id, factory }) => {
  const loaded = factory(name => name === 'react' ? { createElement: (...args) => args } : {});
  if (id === '@local/dsh-personal-spending') spendingClient = loaded;
  else balanceClient = loaded;
} }, dispatchEvent() {} }, Event: class {} });
vm.runInNewContext(source, loader('spending'));
vm.runInNewContext(readFileSync(new URL('../src/balance/client.js', import.meta.url), 'utf8'), loader('balance'));
const registered = [];
spendingClient.apply({ slots: { inject: (_name, callback) => callback(), register: (options, component) => { registered.push({ options, component }); return () => {}; } } });
assert.equal(registered.length, 2, 'plugin detail page plus the status-page tab');
const detail = registered.find(entry => entry.options.name === 'plugins.row.config');
assert.equal(detail.options.key, '@local/dsh-personal-customizations#personal-spending');
assert.ok(detail.component({ view: 'page' }));
assert.equal(detail.component({ view: 'summary' }), null);
const tab = registered.find(entry => entry.options.name === 'intelligence.status.tab');
assert.equal(tab.options.id, 'spending');
assert.equal(tab.options.label, '余额总览');
assert.ok(tab.component(), 'the status tab renders the same spending page');
assert.equal(typeof balanceClient.apply, 'function');
const components = JSON.parse(readFileSync(new URL('../config/components.json', import.meta.url), 'utf8'));
const patch = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8');
assert.equal(Object.keys(components).length, 4, 'spending is a separate fourth component');
assert.equal(components.balance.host, 'applyBalance', 'old balance component stays independent');
assert.equal(components.spending.host, 'applySpendingHost');
assert.deepEqual(components.spending.inject, ['@deepseek-ai/dsh-client-ui-plugin-manager']);
assert.match(patch, /- id: personal-spending\s+name: '@local\/dsh-personal-spending'/);
assert.doesNotMatch(source, /sidebar\.panellist|key: 'personal-spending'/, 'spending stays out of main sidebar');
console.log('PASS persistent accounting: streams unchanged, cumulative usage, failures, per-key routing, long history, corrupt DB protection, scoped queries, exclusion, disabled lifecycle, currency isolation; no external calls.');
