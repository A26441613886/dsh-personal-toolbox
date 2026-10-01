// Offline CSS/placeholder contract checks; not a browser geometry test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/intelligence/client.js', import.meta.url), 'utf8');
const start = source.indexOf('const intelligenceWorkbenchCss = [');
const end = source.indexOf('const intelligenceWorkbenchTag', start);
const css = vm.runInNewContext(source.slice(start, end) + '; intelligenceWorkbenchCss');
const rules = new Map([...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => [selector.trim(), Object.fromEntries(body.split(';').filter(Boolean).map(declaration => { const i = declaration.indexOf(':'); return [declaration.slice(0, i), declaration.slice(i + 1)]; }))]));
const scope = '.dshIw_workbench:not(.dshIw_previewMode) .dshIt_statusCard ';
assert.equal(rules.get(scope + '.dshIw_preview').display, 'flex');
assert.equal(rules.get(scope + '.dshIw_preview')['flex-direction'], 'column');
assert.equal(rules.get(scope + '.dshIw_preview').gap, '12px');
assert.equal(rules.get(scope + '.dshIw_previewEmpty').height, 'auto');
assert.equal(rules.get(scope + '.dshIw_previewEmpty')['min-height'], '170px');
assert.equal(rules.get(scope + '.dshIw_previewEmpty').flex, '1 0 auto');
assert.equal(rules.get(scope + '.dshIw_candyResult')['margin-top'], 'auto');
assert.equal(rules.get(scope + '.dshIw_previewSlot').flex, 'none', 'HTML previews must not be stretched');
assert.equal(rules.get('.dshIw_previewMode .dshIw_preview').display, 'grid');
assert.equal(rules.get('.dshIw_previewMode .dshIw_preview')['grid-template-rows'], '29px 240px minmax(64px,1fr)');
assert.equal(rules.get('.dshIw_previewMode .dshIw_previewEmpty').height, '240px');
assert.equal(rules.get('.dshIw_previewZoomDialog .dshIw_staticThumb').height, '88px');

const fnStart = source.indexOf('function IntelligencePreviewPlaceholder(');
const fnEnd = source.indexOf('function IntelligenceSaveOverlay(', fnStart);
const jsx = (type, props) => ({ type, props });
const render = vm.runInNewContext(source.slice(fnStart, fnEnd) + '; IntelligencePreviewPlaceholder', { react_jsx_runtime: { jsx, jsxs: jsx }, intelligenceProgressLabel: () => 'waiting' });
for (const question of [undefined, { pending: true }, { completed: false, raw: 'connection failed' }, { completed: false, code: 'TIMEOUT', raw: 'timed out' }, { completed: true, passed: false, previewError: 'no preview' }, { completed: false, code: 'CANCELLED', raw: 'cancelled' }]) {
  const view = render({ question, selectedTestMode: 'combo' });
  assert.ok(view.props.className.includes('dshIw_previewEmpty'));
  assert.equal(view.props.role, 'status');
  if (question?.raw && question.code !== 'CANCELLED') assert.equal(view.props.children[2].props.children, question.raw);
}
assert.equal(render({ question: { completed: false, raw: 'failure' } }).props.children[1].props.children, '请求失败');
assert.equal(render({ question: { completed: false, code: 'TIMEOUT', raw: 'timeout' } }).props.children[1].props.children, '检测超时');
console.log('PASS: scoped detail-column flex layout, expandable error/empty area, bottom-aligned candy, preserved 240px grid and 88px history, unchanged error messages; no browser/model calls.');
