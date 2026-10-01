import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { projectRoot, sourcePath } from './paths.mjs';
import { readClientSource } from './client-sources.mjs';

export const personalPackageNames = ['dsh-personal-customizations', 'dsh-personal-intelligence', 'dsh-personal-balance', 'dsh-personal-spending', 'dsh-client-ui-prompt-presets'];
export const spendingCssMarker = '/*SPENDING_CSS*/';
export function injectSpendingCss(source, css) {
  if (!source.includes(spendingCssMarker)) throw new Error('spending/client.js is missing the ' + spendingCssMarker + ' placeholder');
  return source.replace(spendingCssMarker, () => css.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n'));
}
export function linkLocalPackage(link, target) {
  fs.mkdirSync(path.dirname(link), { recursive: true });
  let stat;
  try { stat = fs.lstatSync(link); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (stat) {
    if (!stat.isSymbolicLink()) throw new Error('Refusing to replace existing non-link package: ' + link);
    if (fs.existsSync(link) && fs.realpathSync(link) === fs.realpathSync(target)) return;
    fs.unlinkSync(link);
  }
  fs.symlinkSync(target, link, 'junction');
}

export function buildPersonalPlugin({ root = projectRoot, check = false } = {}) {
  const sources = path.join(root, 'plugins', 'personal-toolbox');
  const output = path.join(root, 'packages', 'dsh-personal-customizations');
  const read = relative => fs.readFileSync(sourcePath(relative, sources));
  const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
  const manifest = JSON.parse(read('config/patches.json'));
  // Direct build is guarded too; never bless a changed upstream installation.
  for (const [pkg, version] of Object.entries({ '@deepseek-ai/dsh': manifest.dsh, ...manifest.packages })) {
    const actual = JSON.parse(fs.readFileSync(path.join(root, 'node_modules', pkg, 'package.json'), 'utf8')).version;
    if (actual !== version) throw Error('Incompatible ' + pkg + ': expected ' + version + ', installed ' + actual);
  }
  const sourceMeta = JSON.parse(read('package.json'));
  const runtimeMeta = { ...sourceMeta, main: 'lib/index.js', icon: './icon.svg', exports: {
    '.': './lib/index.js', './services': './lib/services.js', './package.json': './package.json',
    './cordis.patch.yml': './cordis.patch.yml', './locale/*.json': './locale/*.json'
  }, files: ['lib', 'locale', 'icon.svg', 'cordis.patch.yml', 'README.md', 'LICENSE', 'THIRD-PARTY-NOTICES.md'], dependencies: Object.fromEntries(personalPackageNames.slice(1).map(name => ['@local/' + name, 'file:../' + name])) };
  delete runtimeMeta.scripts;
  delete runtimeMeta.toolbox;
  const files = new Map([
    ['package.json', json(runtimeMeta)], ['README.md', read('README.md')],
    ['LICENSE', read('LICENSE')], ['THIRD-PARTY-NOTICES.md', read('THIRD-PARTY-NOTICES.md')],
    ['cordis.patch.yml', read('cordis.patch.yml')], ['icon.svg', read('assets/icons/toolbox.svg')],
    ['locale/zh.json', read('locale/zh.json')], ['locale/en.json', read('locale/en.json')],
    ['lib/index.js', read('src/bundle/index.js')], ['lib/services.js', Buffer.from(read('src/shared/services.js').toString('utf8').replace("from '../spending/host.js'", "from './patched-personal-spending-host.js'"))],
    // Keep the established runtime filename; only rewrite the relative source import.
    ['lib/patched-personal-spending-host.js', read('src/spending/host.js')]
  ]);
  const compatibility = manifest.patches.map(patch => {
    const [scope, name, ...rest] = patch.dest.split('/');
    const pkg = scope + '/' + name;
    return { package: pkg, file: rest.join('/'), version: manifest.packages[pkg], sha256: createHash('sha256').update(readClientSource(patch.src, sources)).digest('hex') };
  });
  files.set('lib/compatibility.json', json({ dsh: manifest.dsh, files: compatibility }));
  const outputs = new Map([...files].map(([name, body]) => [path.join(output, name), body]));
  const components = JSON.parse(read('config/components.json'));
  const spendingCss = read('src/spending/style.css').toString('utf8');
  for (const [id, component] of Object.entries(components)) {
    const directory = path.join(root, 'packages', component.name.split('/')[1]);
    let meta;
    if (component.host) {
      meta = { name: component.name, version: sourceMeta.version, private: true, type: 'module', main: 'lib/index.js', exports: { '.': './lib/index.js', './services': './lib/services.js', './client': './lib/client.js', './package.json': './package.json' }, dsh: { client: { platform: 'web', inject: component.inject } } };
      const host = `import { assertCompatible } from '@local/dsh-personal-customizations';\nimport { ${component.host}, Config, inject } from '@local/dsh-personal-customizations/services';\nexport { Config, inject };\nexport function apply(ctx) { assertCompatible(); ${component.host}(ctx); }\n`;
      outputs.set(path.join(directory, 'lib/index.js'), Buffer.from(host));
      const client = readClientSource(component.client, sources).toString('utf8');
      outputs.set(path.join(directory, 'lib/client.js'), Buffer.from(id === 'spending' ? injectSpendingCss(client, spendingCss) : client));
    } else {
      // Prompts are now durable source, never read back from generated packages.
      meta = JSON.parse(read('src/prompts/package.json'));
      outputs.set(path.join(directory, 'lib/index.js'), read('src/prompts/host.js'));
      outputs.set(path.join(directory, 'lib/client.js'), read('src/prompts/client.js'));
    }
    meta.license = 'MIT';
    outputs.set(path.join(directory, 'LICENSE'), read('LICENSE'));
    outputs.set(path.join(directory, 'THIRD-PARTY-NOTICES.md'), read('THIRD-PARTY-NOTICES.md'));
    meta.description = component.description;
    if (component.icon) {
      meta.icon = './icon.svg';
      outputs.set(path.join(directory, 'icon.svg'), read(component.icon));
    }
    meta.exports['./locale/*.json'] = './locale/*.json';
    outputs.set(path.join(directory, 'package.json'), json(meta));
    for (const locale of ['zh', 'en']) outputs.set(path.join(directory, 'locale', locale + '.json'), json({ meta: { title: component.title, description: component.description } }));
  }
  // All inputs have been read before the first write; output package paths/IDs stay stable.
  const changed = [];
  for (const [dest, body] of outputs) {
    if (fs.existsSync(dest) && fs.readFileSync(dest).equals(body)) continue;
    changed.push(path.relative(root, dest));
    if (!check) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, body); }
  }
  if (!check) for (const name of personalPackageNames) linkLocalPackage(path.join(root, 'node_modules', '@local', name), path.join(root, 'packages', name));
  console.log('[personal-plugin] ' + (check ? (changed.length ? 'needs build' : 'current') : 'restored') + ' — classified source (' + outputs.size + ' artifacts)');
  return { changed, output };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildPersonalPlugin({ check: process.argv.includes('--check') });
