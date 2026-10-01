// Data-free, checksummed source export. Does not install, register or restart.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { sourceRoot, projectRoot } from './paths.mjs';
const argument = process.argv.indexOf('--destination');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
if (argument >= 0 && (!process.argv[argument + 1] || process.argv[argument + 1].startsWith('--'))) throw Error('--destination requires a new directory path');
const destination = path.resolve(argument < 0 ? path.join(projectRoot, 'output', 'personal-toolbox-source-' + stamp) : process.argv[argument + 1]);
if (destination === path.resolve(sourceRoot) || destination.startsWith(path.resolve(sourceRoot) + path.sep)) throw Error('Cannot export inside the source tree');
if (fs.existsSync(destination) || fs.existsSync(destination + '.zip')) throw Error('Export exists; refusing to overwrite');
// Explicit source allowlist. Never read browser profiles/localStorage/IndexedDB,
// saved prompt contents, chat records, credentials, ledgers or generated answers.
const included = ['LICENSE', 'THIRD-PARTY-NOTICES.md', 'package.json', 'cordis.patch.yml', 'README.md', 'src', 'compat', 'config', 'assets', 'locale', 'tools', 'tests', 'docs'];
const entries = [];
function collect(relative) {
  const source = path.join(sourceRoot, relative), stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) throw Error('Unexpected link in source: ' + relative);
  if (stat.isDirectory()) { for (const name of fs.readdirSync(source).sort()) collect(path.join(relative, name)); return; }
  const body = fs.readFileSync(source);
  entries.push({ relative, body, sha256: createHash('sha256').update(body).digest('hex') });
}
for (const name of included) collect(name);
for (const { relative, body, sha256 } of entries) {
  const out = path.join(destination, 'personal-toolbox', relative);
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, body);
  if (createHash('sha256').update(fs.readFileSync(out)).digest('hex') !== sha256) throw Error('Export verification failed: ' + relative);
}
fs.writeFileSync(path.join(destination, 'source-manifest.json'), JSON.stringify({ format: 'harness-local-bundle-source', name: '@local/dsh-personal-customizations', compatibleHarness: '0.2.0-rc.2', containsUserData: false, install: 'Read personal-toolbox/docs/DIRECTORY.md; requires the compatible Harness checkout, not a generic plugin installer.', files: entries.map(({ relative, sha256, body }) => ({ path: relative.replaceAll('\\', '/'), size: body.length, sha256 })) }, null, 2) + '\n');
if (process.platform === 'win32' && !process.argv.includes('--directory-only')) {
  const literal = value => "'" + value.replaceAll("'", "''") + "'";
  const script = `$ErrorActionPreference='Stop'; Compress-Archive -LiteralPath ${literal(path.join(destination, 'personal-toolbox'))},${literal(path.join(destination, 'source-manifest.json'))} -DestinationPath ${literal(destination + '.zip')}`;
  const encoded = Buffer.from(script, 'utf16le').toString('base64');
  const result = spawnSync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', encoded], { stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error('ZIP export failed; verified directory remains: ' + destination);
  console.log('Verified source ZIP: ' + destination + '.zip');
}
console.log('Verified source export: ' + destination + ' (' + entries.length + ' files; no user data).');
