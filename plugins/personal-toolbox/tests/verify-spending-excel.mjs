import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { spendingExcelSheets, spendingExcelBytes } from '../src/spending/excel.js';
import { readClientSource } from '../tools/client-sources.mjs';

const data = {
  today: '2026-10-01', startedAt: 0, prices: [{ provider: 'p', model: 'm', key_id: 'b', unit: 'USD', input: 2, output: 8, cache_read: 1, cache_write: 0 }],
  preferences: [{ provider: 'p', key_id: 'b' }, { provider: 'q', key_id: '__exclude__' }],
  providers: [{ id: 'p', name: '=HYPERLINK("bad") &供应商', defaultKey: 'a', keys: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], models: [{ id: 'm', name: '模型M' }], apiKey: 'secret-not-exported', credentialRef: 'private-reference', baseURL: 'https://private.invalid' }, { id: 'q', name: 'Q', defaultKey: 'a', keys: [{ id: 'a', name: 'A' }] }],
  ledger: { 'p\ta': { days: { '2020-01-01': { 元: 7 } } }, 'p\tb': { days: { '2026-10-01': { USD: 3, 元: 2, EUR: 4 } }, samples: [{ at: 0, readings: [{ unit: 'USD', remaining: 97, used: 3 }] }], last: { at: 0, readings: [{ unit: 'USD', remaining: 97, used: 3 }] } }, 'q\ta': { days: { '2026-10-01': { 元: 100 } } }, 'deleted\told': { days: { '2019-12-31': { 元: 6 } } } },
  rows: [{ day: '2026-10-01', provider: 'p', model: 'm', key_id: 'b', source: 'chat', calls: 2, failures: 1, missing: 1, input: 1000000, output: 1000000, cache_read: 1000000, cache_write: 0 }, { day: '2020-01-01', provider: 'p', model: 'missing', key_id: 'a', source: 'intelligence', calls: 1, failures: 0, missing: 0, input: 12, output: 8, cache_read: 0, cache_write: 0 }, { day: '2026-10-01', provider: 'p', model: 'm', key_id: 'b', source: 'other', calls: 1, failures: 1, missing: 1, input: 0, output: 0, cache_read: 0, cache_write: 0 }]
};
const before = JSON.stringify(data);
const sheets = spendingExcelSheets(data, '2026-10-01T00:00:00.000Z');
assert.equal(JSON.stringify(data), before, 'no ledger/config mutations');
assert.deepEqual(sheets.map(s => s.name), ['阅读说明', '每日汇总', '余额明细', '模型用量', '余额读数', '单价设置', '统计设置']);
const daily = sheets[1].rows.find(r => r[0] === '2026-10-01' && r[1] === '元');
assert.equal(daily[2], 5, 'only representative key included; display-unit folding matches UI');
assert.equal(daily[3], 11, 'estimate kept separate from balance; only recorded usage estimated');
assert.equal(daily[5], 2, 'missing calls remain visible');
assert.equal(sheets[2].rows.length, 6, 'all keys, original currencies, excluded/deleted identities and old records retained');
assert.ok(sheets[2].rows.some(r => r[0] === '2019-12-31'));
assert.equal(sheets[3].rows[0][12], null, 'unpriced estimate blank, not zero');
assert.equal(sheets[3].rows.find(r => r[4] === '其他')[12], null, 'fully missing usage blank, not free');
assert.equal(sheets[4].rows.length, 2, 'last reading distinguished from sample');
assert.ok(sheets[0].rows.some(r => r[1].includes('不代表真实汇率换算')));
assert.ok(sheets[0].rows.some(r => r[1].includes('不是可直接恢复的数据库备份')));

const bytes = spendingExcelBytes(sheets), zip = Buffer.from(bytes);
const files = new Map(); let position = 0;
// Independent bitwise CRC implementation and ZIP local/central integrity checks.
const crc32 = body => { let crc = -1; for (const byte of body) { crc ^= byte; for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1; } return (crc ^ -1) >>> 0; };
while (zip.readUInt32LE(position) === 0x04034b50) {
  assert.equal(zip.readUInt16LE(position + 8), 0);
  const size = zip.readUInt32LE(position + 18), n = zip.readUInt16LE(position + 26), extra = zip.readUInt16LE(position + 28);
  const name = zip.subarray(position + 30, position + 30 + n).toString('utf8');
  const body = zip.subarray(position + 30 + n + extra, position + 30 + n + extra + size);
  assert.equal(crc32(body), zip.readUInt32LE(position + 14), name);
  files.set(name, { body: body.toString('utf8'), position });
  position += 30 + n + extra + size;
}
const centralOffset = position; let count = 0;
while (zip.readUInt32LE(position) === 0x02014b50) {
  const n = zip.readUInt16LE(position + 28), name = zip.subarray(position + 46, position + 46 + n).toString('utf8');
  assert.equal(zip.readUInt32LE(position + 42), files.get(name).position); count++;
  position += 46 + n + zip.readUInt16LE(position + 30) + zip.readUInt16LE(position + 32);
}
assert.equal(zip.readUInt32LE(position), 0x06054b50);
assert.equal(zip.readUInt16LE(position + 10), count);
assert.equal(zip.readUInt32LE(position + 16), centralOffset);
assert.equal(zip.readUInt32LE(position + 12), position - centralOffset);
assert.equal(zip.length, position + 22);
assert.equal(files.size, 12);
const all = [...files.values()].map(v => v.body).join('');
assert.ok(!all.includes('<f>'), 'no executable spreadsheet formulas');
for (const secret of ['secret-not-exported', 'private-reference', 'https://private.invalid']) assert.ok(!all.includes(secret));
assert.ok(all.includes('=HYPERLINK(&quot;bad&quot;) &amp;供应商'), 'formula-looking names exported as inert strings');
assert.ok(all.includes('t="inlineStr"'));
assert.match(files.get('xl/worksheets/sheet2.xml').body, /<c r="C\d+" s="[45]"><v>5<\/v>/);
for (let i = 2; i <= 7; i++) {
  const body = files.get(`xl/worksheets/sheet${i}.xml`).body;
  assert.ok(body.includes('state="frozen"'));
  assert.ok(body.includes('<autoFilter'));
}
assert.throws(() => spendingExcelBytes([{ ...sheets[0], name: 'bad/name' }]), /名称/);
assert.throws(() => spendingExcelBytes([{ ...sheets[0], rows: [['x', 'x'.repeat(32768)]] }]), /上限/);
const raw = fs.readFileSync(new URL('../src/spending/client.js', import.meta.url), 'utf8');
const built = readClientSource('src/spending/client.js').toString('utf8');
assert.ok(!built.includes('/*SPENDING_EXCEL*/'));
assert.ok(built.includes('function spendingExcelBytes('));
assert.ok(raw.includes('导出 Excel'));
assert.ok(raw.includes('dsh-sp--export'));
// Exercise the exact browser export handler with mocked DOM/Blob, never a real download.
const begin = raw.indexOf('const exportData ='), end = raw.indexOf('const post =', begin);
let blob, clicked = false, removed = false, revoked = false, caught, download;
const handler = vm.runInNewContext(raw.slice(begin, end) + ';exportData', { data, spendingExcelBytes, spendingExcelSheets,
  Blob: class { constructor(parts, options) { blob = { parts, options }; } }, URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => { revoked = true; } },
  document: { body: { appendChild: () => {} }, createElement: () => ({ click() { clicked = true; download = this.download; }, remove() { removed = true; } }) }, setTimeout: fn => fn(), setError: e => { caught = e; } });
handler();
assert.equal(caught, undefined);
assert.ok(clicked && removed && revoked);
assert.equal(download, '消费账本-2026-10-01.xlsx');
assert.equal(blob.options.type, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
assert.equal(Buffer.from(blob.parts[0]).readUInt32LE(0), 0x04034b50);
const fail = vm.runInNewContext(raw.slice(begin, end) + ';exportData', { data, spendingExcelBytes: () => { throw Error('test failure'); }, spendingExcelSheets, setError: e => { caught = e; } });
fail(); assert.ok(caught.includes('原账本未修改'));
if (process.argv[2]) {
  if (fs.existsSync(process.argv[2])) throw Error('Refusing to overwrite sample output');
  fs.writeFileSync(process.argv[2], bytes); // synthetic fixture only, never the real ledger
}
console.log('PASS: real XLSX/ZIP CRC and offsets, 7 sheets, numeric amounts/blank unknowns, full history and raw currencies, filtering/frozen headers, no secrets/formulas, build inlining and mocked download/error cleanup; no user data or browser/model calls.');
