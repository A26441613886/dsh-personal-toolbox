import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm, readdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { recordBalanceHistory, loadBalanceHistory, applyBalanceSample } from '../src/shared/services.js';

const directory = await mkdtemp(join(tmpdir(), 'dsh-spend-persistence-'));
const file = join(directory, 'balance-history.json');
try {
  const t = Date.now(), sample = used => [{ used, remaining: 100 - used, unit: '元' }];
  await recordBalanceHistory('p', 'a', sample(10), t, file);
  await recordBalanceHistory('p', 'a', sample(12), t + 1, file);
  await recordBalanceHistory('p', 'b', sample(50), t + 2, file);
  assert.equal((await loadBalanceHistory('p', 'a', file)).today[0].spend, 2);
  assert.equal((await loadBalanceHistory('p', 'b', file)).today.length, 0);
  await Promise.all([
    recordBalanceHistory('p', 'a', sample(13), t + 3, file),
    recordBalanceHistory('p', 'b', sample(55), t + 4, file)
  ]);
  assert.equal((await loadBalanceHistory('p', 'a', file)).today[0].spend, 3);
  assert.equal((await loadBalanceHistory('p', 'b', file)).today[0].spend, 5);
  const ledger = JSON.parse(await readFile(file, 'utf8'));
  const prior = ledger['p\ta'];
  assert.equal(applyBalanceSample(prior, sample(10), t), prior, 'old responses cannot rewind the baseline');
  prior.days['2020-01-01'] = { 元: 7 };
  for (let i = 0; i < 90; i++) ledger['old\t' + i] = { days: { '2020-01-01': { 元: 1 } } };
  await writeFile(file, JSON.stringify(ledger));
  await recordBalanceHistory('p', 'a', sample(14), t + 5, file);
  const saved = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(saved['p\ta'].days['2020-01-01'].元, 7);
  assert.equal(Object.keys(saved).length, 92, 'no automatic eviction of older keys');
  const backup = await readFile(file + '.bak', 'utf8');
  assert.deepEqual(JSON.parse(backup), ledger, 'backup preserves last valid ledger');
  await writeFile(file, '{broken');
  await assert.rejects(recordBalanceHistory('p', 'a', sample(15), t + 6, file));
  assert.equal(await readFile(file, 'utf8'), '{broken');
  assert.equal(await readFile(file + '.bak', 'utf8'), backup);
  assert.equal((await readdir(directory)).filter(name => name.includes('.tmp')).length, 0);
  // The serialization queue recovers after a failed write.
  await writeFile(file, JSON.stringify(saved));
  await recordBalanceHistory('p', 'a', sample(15), t + 7, file);
  assert.equal((await loadBalanceHistory('p', 'a', file)).today[0].spend, 5);
} finally {
  await rm(directory, { recursive: true, force: true });
}

const source = readFileSync(new URL('../compat/models/client.js', import.meta.url), 'utf8');
const begin = source.indexOf('const SPEND_HISTORY_KEY ='), end = source.indexOf('const formatSpendAmounts', begin);
const storage = new Map();
const context = {
  localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
  window: { dispatchEvent() {} }, CustomEvent: class {},
};
const api = vm.runInNewContext(source.slice(begin, end) + ';({recordLocalSpend,loadLocalSpend,persistSpendHistory,spendDay})', context);
const today = api.spendDay();
const summary = (date, spend) => ({ days: [{ date, amounts: [{ unit: '元', spend }] }] });
api.persistSpendHistory('p', 'a', summary(today, 3));
api.persistSpendHistory('p', 'a', summary('2020-01-01', 7));
api.persistSpendHistory('p', 'b', summary(today, 9));
api.persistSpendHistory('p', 'a', { today: [], days: [] });
api.persistSpendHistory('p', 'a', summary(today, 1));
assert.equal(api.loadLocalSpend('p', 'a').today[0].spend, 3, 'empty/older server data cannot erase a larger local reading');
assert.equal(api.loadLocalSpend('p', 'b').today[0].spend, 9, 'key isolation');
assert.equal(api.loadLocalSpend('other', 'a').today.length, 0, 'provider isolation');
assert.equal(api.loadLocalSpend('p', 'a').days.find(d => d.date === '2020-01-01').amounts[0].spend, 7);
const reopened = vm.runInNewContext(source.slice(begin, end) + ';({loadLocalSpend})', { ...context });
assert.equal(reopened.loadLocalSpend('p', 'a').today[0].spend, 3, 'reopening retains the server snapshot');
const stored = JSON.parse(storage.get('dsh.local.balanceHistory.v1'));
assert.equal(stored['p\ta'].snapshot.today, undefined, 'snapshot uses dates so yesterday does not become today');
console.log('PASS: per-key disk persistence, concurrent writes, backup, damaged-file protection, old-key/day retention, stale-sample protection, browser/server merging, reopen and dated snapshots. No real user data or network calls.');
