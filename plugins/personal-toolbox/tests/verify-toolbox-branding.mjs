import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { sourcePath, projectRoot } from '../tools/paths.mjs';

const json = relative => JSON.parse(fs.readFileSync(sourcePath(relative), 'utf8'));
const zh = json('locale/zh.json'), en = json('locale/en.json'), meta = json('package.json');
assert.equal(zh.meta.title, '星潮工具箱');
assert.equal(en.meta.title, 'Starwave Toolkit');
assert.ok(zh.meta.description.length < 60, 'list description stays concise');
assert.equal(meta.name, '@local/dsh-personal-customizations', 'runtime identity must not change');
assert.equal(Object.keys(json('config/components.json')).length, 4);
const icon = fs.readFileSync(sourcePath('assets/icons/toolbox.svg'), 'utf8');
assert.match(icon, /viewBox="0 0 64 64"/);
assert.match(icon, /<ellipse/);
assert.ok(!/<script|foreignObject|https?:/.test(icon.replace('http://www.w3.org/2000/svg', '')), 'icon is self-contained');
assert.equal(fs.readFileSync(path.join(projectRoot, 'packages/dsh-personal-customizations/icon.svg'), 'utf8'), icon, 'icon reached the built bundle');
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(projectRoot, 'packages/dsh-personal-customizations/locale/zh.json'), 'utf8')), zh);
const source = fs.readFileSync(sourcePath('src/intelligence/client.js'), 'utf8');
const start = source.indexOf('    function PersonalPluginDetails() {');
const end = source.indexOf('    // Reuse the data owner', start);
assert.ok(start >= 0 && end > start);
const h = (type, props) => ({ type, props });
const tree = vm.runInNewContext(source.slice(start, end) + '\nPersonalPluginDetails();', {
  react: { useState: initial => [initial, () => {}] },
  react_jsx_runtime: { jsx: h, jsxs: h }
});
const nodes = [];
function visit(node) {
  if (Array.isArray(node)) return node.forEach(visit);
  if (!node || typeof node !== 'object') return;
  nodes.push(node);
  visit(node.props?.children);
}
visit(tree);
assert.equal(nodes.filter(n => n.type === 'article').length, 4);
assert.equal(nodes.filter(n => n.type === 'svg').length, 5, 'feature cards and compatibility intro use SVG icons');
assert.ok(nodes.some(n => n.type === 'h3' && n.props.children === '让 AI 工作流更顺手'));
assert.ok(nodes.some(n => n.props.children === 'STARWAVE · 星潮工具箱'));
assert.equal(nodes.filter(n => n.type === 'button').length, 1, 'only the existing source-folder action; no new toggles');
assert.ok(source.includes('key: "@local/dsh-personal-customizations"'), 'detail registration identity remains unchanged');
console.log('PASS Starwave branding: bilingual metadata, short description, self-contained orbit/star icon, four rendered feature cards, SVG icons and stable package identity; no profile changes, restart, browser or external calls.');
