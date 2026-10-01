import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { sourcePath } from '../tools/paths.mjs';
import { readClientSource } from '../tools/client-sources.mjs';

const entries = [
  ['modelMenu', 'model-selection', 'compat/model-selection/client.js'],
  ['models', 'models', 'compat/models/client.js'],
  ['sessions', 'sessions', 'compat/sessions/client.js'],
  ['skills', 'skills', 'compat/skills/client.js']
];
function evaluate(source, preferences = {}, cookie = '') {
  let registration, face;
  const stub = { Service: class {}, Component: class {}, memo: f => f, forwardRef: f => f };
  const context = vm.createContext({
    window: { __ModuleLoader__: { load: row => { assert.equal(registration, undefined, 'exactly one registration'); registration = row; face = row.factory(() => stub); } } },
    localStorage: { getItem: () => JSON.stringify(preferences), setItem: () => assert.fail('startup must not write preferences'), removeItem: () => assert.fail('must not delete data') },
    // Do not install a DOM: avoids stylesheet side effects in this offline test.
    ...(cookie ? { document: { cookie, querySelector: () => ({}) } } : {})
  });
  vm.runInContext(source, context);
  assert.equal(typeof face?.apply, 'function', 'client is not disabled/empty');
  assert.ok(Array.isArray(face.inject));
  return { face, registration };
}
const provenance = JSON.parse(fs.readFileSync(sourcePath('compat/baseline/provenance.json'), 'utf8').replace(/^\uFEFF/, ''));
for (const [id, name, relative] of entries) {
  const baseline = fs.readFileSync(sourcePath('compat/baseline/' + name + '.js'));
  const record = provenance.files.find(row => row.file === name + '.js');
  assert.equal(createHash('sha256').update(baseline).digest('hex'), record.sha256);
  const original = evaluate(baseline.toString('utf8'));
  const built = readClientSource(relative).toString('utf8');
  const disabled = evaluate(built, { [id]: false });
  assert.equal(disabled.registration.id, original.registration.id, 'stable official module ID');
  assert.equal(disabled.face.apply.toString(), original.face.apply.toString(), 'disabled calls the actual official apply: ' + id);
  assert.deepEqual([...disabled.face.inject], [...original.face.inject], 'official service dependencies: ' + id);
  const cookieDisabled = evaluate(built, {}, 'dsh_compat_v1=00000');
  assert.equal(cookieDisabled.face.apply.toString(), original.face.apply.toString(), 'fallback cookie also restores baseline');
  const enhanced = evaluate(built);
  assert.notEqual(enhanced.face.apply.toString(), original.face.apply.toString(), 'enabled uses enhanced factory: ' + id);
}

// Independently disabling the slider must restore ordinary radio options, not
// discard model reasoning metadata or hide the effort selector.
const source = fs.readFileSync(sourcePath('compat/model-selection/client.js'), 'utf8');
assert.ok(!source.includes('effortOff ? void 0 : currentChoice?.model.reasoning'));
assert.ok(source.includes('effortOff ? effortChoices.map(level =>'));
assert.ok(source.includes('role: "menuitemradio"'));
const begin = source.indexOf('const effortChoices = (0, react.useMemo)');
const end = source.indexOf('const { pending } = state;', begin);
const reasoning = { defaultEffort: 'high', efforts: [{ id: 'minimal', name: 'Minimal' }, { id: 'high', name: 'High' }] };
const choices = vm.runInNewContext(source.slice(begin, end) + ';effortChoices', { reasoning, effortOff: true, t: k => k, localizedEffortName: () => assert.fail('original effort labels required'), react: { useMemo: f => f() } });
assert.deepEqual(JSON.parse(JSON.stringify(choices)), [ { key: 'effort:minimal', effort: 'minimal', label: 'Minimal' }, { key: 'effort:high', effort: 'high', label: 'High' } ]);
console.log('PASS: four official baselines verified; disabled factories retain official apply/dependencies/module IDs; cookie fallback selects original UI; enabled factories retain enhancements; slider-off restores radio options rather than hiding reasoning; zero browser/model calls.');
