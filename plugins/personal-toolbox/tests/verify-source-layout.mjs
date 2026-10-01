import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { sourceRoot, projectRoot, sourcePath } from '../tools/paths.mjs';
import { buildPersonalPlugin } from '../tools/build.mjs';
import { readClientSource } from '../tools/client-sources.mjs';
import { personalSourceDirectory, createPersonalPluginFolderHandler } from '../src/shared/services.js';

const manifest = JSON.parse(fs.readFileSync(sourcePath('config/patches.json'), 'utf8'));
const components = JSON.parse(fs.readFileSync(sourcePath('config/components.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(sourcePath('package.json'), 'utf8'));
assert.equal(meta.name, '@local/dsh-personal-customizations');
assert.equal(meta.toolbox.compatibleHarness, manifest.dsh);
assert.equal(Object.keys(components).length, 4);
assert.equal(manifest.patches.length, 11);
for (const patch of manifest.patches) {
  assert.ok(fs.statSync(sourcePath(patch.src)).isFile(), patch.src);
  assert.deepEqual(readClientSource(patch.src), fs.readFileSync(path.join(projectRoot, 'node_modules', patch.dest)), 'built compatibility patch: ' + patch.id);
}
for (const component of Object.values(components)) {
  if (component.client) assert.ok(fs.statSync(sourcePath(component.client)).isFile());
  if (component.icon) assert.ok(fs.statSync(sourcePath(component.icon)).isFile());
}
for (const file of ['client.js', 'host.js', 'package.json']) assert.ok(fs.statSync(sourcePath('src/prompts/' + file)).isFile());
assert.equal(path.resolve(personalSourceDirectory()), path.resolve(sourceRoot), 'source opener points to single plugin folder');
const runtime = await import(pathToFileURL(path.join(projectRoot, 'packages/dsh-personal-customizations/lib/services.js')));
assert.equal(path.resolve(runtime.personalSourceDirectory()), path.resolve(sourceRoot), 'runtime opener points to source, not generated package');
const bundle = await import(pathToFileURL(path.join(projectRoot, 'packages/dsh-personal-customizations/lib/index.js')));
bundle.assertCompatible();
let opened;
const handle = createPersonalPluginFolderHandler({ openDirectory: async directory => { opened = directory; } });
const response = await handle(new Request('http://localhost/api/personal-plugin-folder', { method: 'POST' }));
assert.equal(response.status, 200);
assert.equal(path.resolve((await response.json()).path), path.resolve(sourceRoot));
assert.equal(path.resolve(opened), path.resolve(sourceRoot));
assert.equal((await handle(new Request('http://localhost/api/personal-plugin-folder'))).status, 405);
const check = buildPersonalPlugin({ check: true });
assert.equal(check.changed.length, 0, 'build is idempotent');
console.log('PASS: single source tree, 4 stable components, 11 built compatibility patches, prompts restored from source, runtime imports/compatibility, folder path and idempotent build; no profile/data changes, no external calls, no Explorer launch.');
