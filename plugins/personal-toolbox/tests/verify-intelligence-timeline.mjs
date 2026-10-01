import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/intelligence/client.js', import.meta.url), 'utf8');
const start = source.indexOf('function intelligenceResultStatus(');
const end = source.indexOf('function IntelligenceTimeline(', start);
const api = vm.runInNewContext(source.slice(start, end) + '; ({ intelligenceResultStatus, buildIntelligenceTimeline })');
const status = api.intelligenceResultStatus;
const timeline = api.buildIntelligenceTimeline;
const now = Date.parse('2026-09-24T12:10:00+08:00');
const minute = 60000;
const candy = (answer, at = now) => ({ mode: 'candy', answer, passed: answer === 21, completed: true, at });

assert.equal(status(null).tone, 'gray');
assert.equal(status(candy(21)).tone, 'good');
assert.equal(status(candy(29)).tone, 'bad');
assert.equal(status({ passed: true, completed: false }).tone, 'bad');
assert.equal(status({ passed: true, previewFailed: true }).tone, 'bad');
assert.equal(status({ pending: true }).tone, 'gray');
for (const [svgPass, candyAnswer, expected] of [[true, 21, 'good'], [true, 29, 'warn'], [false, 21, 'warn'], [false, 29, 'bad']]) {
  assert.equal(status({ questions: [{ mode: 'pelican', passed: svgPass }, candy(candyAnswer)] }).tone, expected);
}
assert.equal(status({ questions: [{ passed: true }, { pending: true }] }).tone, 'gray');

const empty = timeline([], now);
assert.equal(empty.slots.length, 48);
assert.equal(empty.passRate, null);
assert.ok(empty.slots.every(slot => slot.status.tone === 'gray'));
const records = [
  { ...candy(29, now - 5 * minute), id: 'older-failure' },
  { ...candy(21, now - minute), id: 'latest-pass' },
  { ...candy(29, now - 40 * minute), id: 'previous-slot-failure' },
  { ...candy(21, now + minute), id: 'future-ignore' },
  { ...candy(21, empty.start - 1), id: 'outside-ignore' }
];
const result = timeline(records, now);
assert.equal(result.total, 3);
assert.equal(result.passRate, 33, 'Failed requests/answers stay in the denominator; empty slots do not');
assert.equal(result.slots.at(-1).latest.id, 'latest-pass');
assert.equal(result.slots.at(-1).status.tone, 'good', 'Different runs in a slot are not combined into orange');
assert.equal(result.slots.at(-1).records.length, 2);
assert.equal(result.slots.at(-2).status.tone, 'bad');
assert.equal(result.slots.filter(slot => slot.status.tone === 'gray').length, 46);
const moved = timeline(records.filter(record => record.id !== 'future-ignore'), now + 30 * minute);
assert.equal(moved.slots.at(-1).status.tone, 'gray', 'An idle new time slot must be empty');
assert.equal(moved.slots.at(-2).latest.id, 'latest-pass');
assert.equal(moved.start, result.start + 30 * minute);
assert.equal(timeline([candy(21, empty.start)], now).total, 1);
assert.equal(timeline(records, now, 'week').slots.length, 56);
assert.equal(timeline(records, now, 'month').slots.length, 60);
assert.equal(timeline([], now, 'invalid-range').slots.length, 48);
console.log('PASS: time boundaries, idle advancement, gaps, latest-per-slot, complete history, pass-rate denominator, and single/paired-question colors. No model calls.');
