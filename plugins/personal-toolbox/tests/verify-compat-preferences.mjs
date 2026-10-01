import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { readClientSource } from '../tools/client-sources.mjs';
const helper = fs.readFileSync(new URL('../src/shared/compat-preferences.js', import.meta.url), 'utf8');
const ids = ['modelMenu', 'models', 'effort', 'sessions', 'skills'];
const key = 'dsh.local.compat.v1';
const off = Object.fromEntries(ids.map(id => [id, false]));
const on = Object.fromEntries(ids.map(id => [id, true]));
function fixture({ quota = false, blocked = false, cookies = true, initialCookie = '' } = {}) {
  const storage = new Map([['unrelated-history', 'preserve me']]);
  let cookie = initialCookie, lastCookie = '', cookieWrites = 0;
  const document = { get cookie() { return cookie; }, set cookie(value) { cookieWrites++; lastCookie = value; if (cookies) cookie = value.split(';')[0]; } };
  const context = vm.createContext({ document, location: { protocol: 'https:' }, localStorage: {
    getItem(name) { if (blocked) throw Object.assign(new Error('blocked'), { name: 'SecurityError' }); return storage.get(name) ?? null; },
    setItem(name, value) { assert.equal(name, key); if (quota || blocked) throw Object.assign(new Error('not writable'), { name: quota ? 'QuotaExceededError' : 'SecurityError' }); storage.set(name, value); },
    removeItem() { assert.fail('must not delete user data'); }, clear() { assert.fail('must not clear user storage'); }
  }});
  const api = vm.runInContext(helper + ';({readCompatPreferences,writeCompatPreferences,compatLayerOff})', context);
  return { api, context, storage, cookie: () => cookie, lastCookie: () => lastCookie, cookieWrites: () => cookieWrites };
}
const plain = value => JSON.parse(JSON.stringify(value));
const normal = fixture();
normal.storage.set(key, JSON.stringify({ models: false }));
assert.equal(normal.api.readCompatPreferences().models, false);
assert.equal(normal.api.readCompatPreferences().skills, true);
assert.equal(normal.api.writeCompatPreferences(off).storage, 'localStorage');
assert.deepEqual(plain(normal.api.readCompatPreferences()), off);
assert.equal(normal.cookieWrites(), 0);
const full = fixture({ quota: true });
full.storage.set(key, JSON.stringify(on));
assert.equal(full.api.writeCompatPreferences(off).storage, 'cookie');
assert.equal(full.cookie(), 'dsh_compat_v1=00000');
assert.match(full.lastCookie(), /Max-Age=31536000; SameSite=Strict; Secure$/);
assert.deepEqual(plain(full.api.readCompatPreferences()), off, 'cookie beats stale localStorage');
assert.equal(full.storage.get(key), JSON.stringify(on), 'quota does not delete old settings/history');
assert.equal(full.storage.get('unrelated-history'), 'preserve me');
const reopened = fixture({ quota: true, initialCookie: full.cookie() });
assert.deepEqual(plain(reopened.api.readCompatPreferences()), off, 'reload reads persisted fallback');
const restored = fixture({ initialCookie: full.cookie() });
assert.equal(restored.api.writeCompatPreferences(on).storage, 'cookie', 'authoritative cookie updated after local storage recovers');
assert.deepEqual(plain(restored.api.readCompatPreferences()), on);
const denied = fixture({ blocked: true });
assert.equal(denied.api.writeCompatPreferences(off).storage, 'cookie');
assert.deepEqual(plain(denied.api.readCompatPreferences()), off);
const bothDenied = fixture({ quota: true, cookies: false });
assert.throws(() => bothDenied.api.writeCompatPreferences(off), /rejected/);
assert.deepEqual(plain(bothDenied.api.readCompatPreferences()), on);
const malformed = fixture({ initialCookie: 'dsh_compat_v1=broken' });
malformed.storage.set(key, '{"models": false}');
assert.equal(malformed.api.compatLayerOff('models'), true, 'JSON whitespace supported');

// Exercise the actual UI handlers with React state and shared Switch props,
// not a browser: single/all toggles, remount pending status and denied writes.
const client = readClientSource('src/intelligence/client.js').toString('utf8');
const block = client.slice(client.indexOf('const COMPAT_LAYERS_KEY'), client.indexOf('function PersonalPluginDetails()'));
function ui(fix) {
  let state = [], index = 0;
  Object.assign(fix.context, { react: { useState(initial) { const at = index++; if (!(at in state)) state[at] = typeof initial === 'function' ? initial() : initial; return [state[at], value => { state[at] = value; }]; } }, react_jsx_runtime: { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) }, _deepseek_ai_dsh_client_ui_primitives: { Switch: 'SharedSwitch', StateDot: 'StateDot' } });
  const component = vm.runInContext(block + ';CompatLayerSwitches', fix.context);
  const render = () => { index = 0; const tree = component(); const elements = []; const walk = node => { if (!node || typeof node !== 'object') return; if (Array.isArray(node)) return node.forEach(walk); elements.push(node); walk(node.props?.children); }; walk(tree); return elements; };
  return { render, remount: () => { state = []; return render(); } };
}
const view = ui(fixture({ quota: true }));
let rows = view.render();
const switches = () => rows.filter(row => row.type === 'SharedSwitch');
assert.equal(switches().length, 6);
switches()[2].props.onChange(false); rows = view.render();
assert.equal(switches()[2].props.checked, false);
assert.equal(rows.filter(row => row.type === 'StateDot')[1].props.state, 'warning');
rows = view.remount();
assert.equal(rows.filter(row => row.type === 'StateDot')[1].props.state, 'warning', 'reopening panel does not report unapplied status as applied');
switches()[0].props.onChange(false); rows = view.render();
assert.ok(switches().every(row => row.props.checked === false));
switches()[0].props.onChange(true); rows = view.render();
assert.ok(switches().every(row => row.props.checked === true));
const failedView = ui(fixture({ quota: true, cookies: false }));
let failedRows = failedView.render();
failedRows.find(row => row.type === 'SharedSwitch').props.onChange(false);
failedRows = failedView.render();
assert.ok(failedRows.filter(row => row.type === 'SharedSwitch').every(row => row.props.checked));
assert.ok(failedRows.some(row => row.props?.role === 'alert'));
for (const [file, tokens] of [['compat/models/client.js', []], ['compat/model-selection/client.js', ['const compatOff = compatLayerOff']], ['compat/sessions/client.js', ['compatLayerOff("sessions")']], ['compat/skills/client.js', []]]) {
  const consumer = readClientSource(file).toString('utf8');
  assert.ok(consumer.includes(helper), 'same store embedded into ' + file);
  for (const token of tokens) assert.ok(consumer.includes(token));
  assert.ok(!consumer.includes('/*COMPAT_PREFERENCES*/'));
}
for (const file of ['compat/model-selection/client.js', 'compat/models/client.js', 'compat/skills/client.js']) {
  const consumer = readClientSource(file).toString('utf8');
  assert.ok(!consumer.includes('if (compatOff("modelMenu")) return'), 'base entry must remain visible: ' + file);
  assert.ok(!consumer.includes('if (compatLayerOff("models")) return;'), 'base entry must remain visible: ' + file);
  assert.ok(!consumer.includes('if (compatLayerOff("skills")) return;'), 'base entry must remain visible: ' + file);
}
console.log('PASS: existing preferences, localStorage quota/SecurityError fallback, cookie persistence/reload/recovery, verified writes, all/single UI switches, remount pending status, denied-write rollback, shared consumer store; no user data deletions, browser or model calls.');
