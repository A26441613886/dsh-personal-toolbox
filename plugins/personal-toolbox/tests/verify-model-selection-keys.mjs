import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../compat/model-selection/client.js', import.meta.url), 'utf8');
let helpers;
vm.runInNewContext(source.replace('return module.exports;',
  'return { modelKeyGroups, optionsOf, selectionOf, zh, en };'), {
  window: { __ModuleLoader__: { load({ factory }) {
    helpers = factory((id) => id === '@deepseek-ai/cordis' ? { Service: class {} } : {});
  } } }
}, { timeout: 5000 });
const plain = (value) => JSON.parse(JSON.stringify(value));
const t = (key) => helpers.zh[key];
const catalog = {
  id: 'fixture', name: '演示供应商', models: [
    { id: 'same', name: '同名模型' },
    { id: 'same#backup', name: '同名模型' },
    { id: 'old', name: '旧模型' },
    { id: 'missing', name: '失效密钥模型' }
  ]
};
const profile = {
  apiKeys: [
    { id: 'a', name: '主密钥', credentialRef: 'A' },
    { id: 'b', name: '备用密钥', credentialRef: 'B' }
  ],
  activeApiKey: 'a',
  models: [
    { id: 'same', apiKey: 'a' },
    { id: 'same#backup', upstreamModelId: 'same', apiKey: 'b' },
    { id: 'old' },
    { id: 'missing', apiKey: 'removed' }
  ]
};
const namespaces = [{ ns: 'llm-pi-ai', value: { providers: { fixture: profile } } }];
const grouped = helpers.modelKeyGroups(catalog, namespaces, t);
assert.deepEqual(plain(grouped.map(({ id, label, models }) => [id, label, models.map((model) => model.id)])), [
  ['a', '主密钥', ['same', 'old']],
  ['b', '备用密钥', ['same#backup']],
  ['removed', '已移除的密钥', ['missing']]
]);
assert.equal(helpers.selectionOf({ groups: [catalog], current: null }, 'fixture/same#backup').model, 'same#backup');
const options = helpers.optionsOf({ groups: [catalog], current: null, failures: [] }, t);
assert.deepEqual(plain(options.map((row) => row.id)), catalog.models.map((model) => `fixture/${model.id}`));

profile.apiKeys.reverse();
profile.apiKeys[0].name = '备用已改名';
assert.deepEqual(plain(helpers.modelKeyGroups(catalog, namespaces, t).map(({ id, label }) => [id, label])), [
  ['b', '备用已改名'], ['a', '主密钥'], ['removed', '已移除的密钥']
]);
profile.models = undefined;
assert.deepEqual(plain(helpers.modelKeyGroups(catalog, namespaces, t).map((item) => item.id)), ['a']);
assert.equal(helpers.modelKeyGroups(catalog, [], t)[0].label, '默认密钥');
const official = [{ ns: 'llm-deepseek-api-key', value: { apiKeys: [{ id: 'official', name: '官方密钥' }], models: [{ id: 'flash', apiKey: 'official' }] } }];
assert.equal(helpers.modelKeyGroups({ id: 'deepseek-official', models: [{ id: 'flash' }] }, official, t)[0].label, '官方密钥');
assert.equal(helpers.modelKeyGroups({ id: 'deepseek-account', models: [{ id: 'flash' }] }, official, t)[0].label, '默认密钥');
assert.deepEqual(Object.keys(helpers.zh).sort(), Object.keys(helpers.en).sort());
console.log('PASS: provider -> ordered key -> model grouping, aliases, legacy default, renamed/removed keys, official and account fallback, intact selector IDs.');
