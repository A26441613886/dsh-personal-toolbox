// Explicit, one-time profile registration. Restore/build never enables a disabled bundle.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildPersonalPlugin, linkLocalPackage, personalPackageNames } from './build.mjs';
import { projectRoot as root } from './paths.mjs';
const index = process.argv.indexOf('--home');
const dataHome = index >= 0 ? path.resolve(process.argv[index + 1]) : process.env.DSH_HOME?.trim() || path.join(os.homedir(), '.dsh');
const profile = path.join(dataHome, 'profiles', 'web');
const packageFile = path.join(profile, 'package.json');
const patchFile = path.join(profile, 'cordis.patch.yml');
const packageBefore = fs.readFileSync(packageFile, 'utf8');
const patchBefore = fs.readFileSync(patchFile, 'utf8');
const pkg = JSON.parse(packageBefore);
if (!Array.isArray(pkg.dsh?.profile?.bundles)) throw new Error('Unexpected profile structure; no changes made.');
const name = '@local/dsh-personal-customizations';
const oldPrompt = /- insert:\r?\n    - id: ui-prompt-presets\r?\n      name: [^\r\n]*dsh-client-ui-prompt-presets\/lib\/index\.js\r?\n/g;
const matches = [...patchBefore.matchAll(oldPrompt)];
if (matches.length > 1 || (patchBefore.includes('id: ui-prompt-presets') && matches.length !== 1)) throw new Error('Prompt registration differs; no profile changes made.');
const patchAfter = patchBefore.replace(oldPrompt, '');
const { output } = buildPersonalPlugin({ root });
for (const localName of personalPackageNames) {
  const target = path.join(root, 'packages', localName);
  linkLocalPackage(path.join(profile,'node_modules','@local',localName), target);
  linkLocalPackage(path.join(dataHome,'profiles','node_modules','@local',localName), target);
}
pkg.dependencies ??= {};
pkg.dependencies[name] = 'link:' + output.replaceAll('\\','/');
if (!pkg.dsh.profile.bundles.includes(name)) pkg.dsh.profile.bundles.push(name);
const packageAfter = JSON.stringify(pkg, null, 2) + '\n';
if (packageBefore !== packageAfter || patchBefore !== patchAfter) {
  const backup = path.join(profile, 'personal-plugin-migration-' + Date.now());
  fs.mkdirSync(backup);
  fs.writeFileSync(path.join(backup,'package.json'), packageBefore);
  fs.writeFileSync(path.join(backup,'cordis.patch.yml'), patchBefore);
  if (fs.readFileSync(packageFile,'utf8') !== packageBefore || fs.readFileSync(patchFile,'utf8') !== patchBefore) throw new Error('Profile changed concurrently; retry after current edit finishes.');
  function atomic(file, body) { const temp = file + '.personal-tmp'; fs.writeFileSync(temp, body); fs.renameSync(temp, file); }
  try {
    atomic(patchFile, patchAfter);
    atomic(packageFile, packageAfter);
  } catch (error) {
    atomic(patchFile, patchBefore);
    atomic(packageFile, packageBefore);
    throw error;
  }
}
console.log('Registered 我的定制工具箱. Provider configurations and credentials were not changed.');
