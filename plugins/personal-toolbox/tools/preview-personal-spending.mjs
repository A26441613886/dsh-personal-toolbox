// 生成消费总览改版的独立预览页。
//   node plugins/personal-toolbox/tools/preview-personal-spending.mjs [输出路径]
// 使用 plugins/personal-toolbox/src/spending/client.js 的真实渲染结果与
// plugins/personal-toolbox/src/spending/style.css，因此它验证的是实际要发布的界面，
// 而不是另写一份样例。主题变量依据 Harness 浅/深配色的兜底色注入。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const clientPath = join(root, 'src', 'spending', 'client.js');
const cssPath = join(root, 'src', 'spending', 'style.css');
const outputPath = process.argv[2] || join(root, '..', '..', 'output', 'spending-redesign-preview.html');
// 预览哪种统计口径：actual（余额差额，默认）或 estimate（模型估算）。
const previewMode = process.env.SPENDING_PREVIEW_MODE === 'estimate' ? 'estimate' : 'actual';

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const earlier = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10);

const fixture = {
  today,
  startedAt: Date.now() - 86400000 * 42,
  rows: [
    { day: today, provider: 'p', model: 'm1', key_id: 'a', source: 'chat', provider_name: 'DeepSeek 演示', model_name: 'deepseek-chat', key_name: '主线路', calls: 34, missing: 0, input: 4820000, output: 186000, cache_read: 920000, cache_write: 0, failures: 0 },
    { day: today, provider: 'p', model: 'm2', key_id: 'b', source: 'intelligence', provider_name: 'DeepSeek 演示', model_name: 'deepseek-reasoner', key_name: '副线路', calls: 6, missing: 0, input: 1180000, output: 240000, cache_read: 0, cache_write: 12000, failures: 1 },
    { day: today, provider: 'q', model: 'm3', key_id: 'a', source: 'chat', provider_name: '备用线路', model_name: 'deepseek-chat', key_name: '默认密钥', calls: 4, missing: 4, input: 0, output: 0, cache_read: 0, cache_write: 0, failures: 0 },
    { day: yesterday, provider: 'p', model: 'm1', key_id: 'a', source: 'chat', provider_name: 'DeepSeek 演示', model_name: 'deepseek-chat', key_name: '主线路', calls: 21, missing: 0, input: 3100000, output: 120000, cache_read: 410000, cache_write: 0, failures: 0 },
    { day: earlier, provider: 'p', model: 'm1', key_id: 'a', source: 'chat', provider_name: 'DeepSeek 演示', model_name: 'deepseek-chat', key_name: '主线路', calls: 12, missing: 0, input: 1650000, output: 88000, cache_read: 120000, cache_write: 0, failures: 0 }
  ],
  prices: [
    { provider: 'p', model: 'm1', key_id: 'a', unit: '元', input: 2, output: 8, cache_read: 0.5, cache_write: 0 },
    { provider: 'p', model: 'm2', key_id: 'b', unit: '元', input: 4, output: 16, cache_read: 1, cache_write: 4 }
  ],
  preferences: [{ provider: 'p', key_id: 'a' }, { provider: 'q', key_id: '__exclude__' }],
  providers: [
    {
      id: 'p', name: 'DeepSeek 演示 · Main Line', enabled: true, defaultKey: 'a', requestKey: 'a',
      keys: [{ id: 'a', name: '主线路' }, { id: 'b', name: '副线路' }],
      models: [{ id: 'm1', name: 'deepseek-chat', key: 'a' }, { id: 'm2', name: 'deepseek-reasoner', key: 'b' }]
    },
    {
      id: 'q', name: 'DeepSeek 演示 B', enabled: true, defaultKey: 'a', requestKey: 'a',
      keys: [{ id: 'a', name: '默认密钥' }], models: [{ id: 'm3', name: 'deepseek-chat', key: 'a' }]
    },
    { id: 'r', name: 'DeepSeek 演示 C', enabled: false, defaultKey: 'a', requestKey: 'a', keys: [{ id: 'a', name: '默认密钥' }], models: [] }
  ],
  ledger: {
    'p\ta': {
      days: { [today]: { 元: 21.4, USD: 1.15 }, [yesterday]: { 元: 30.3, USD: 0.4 }, [earlier]: { 元: 12.8 } },
      last: { at: Date.now() - 4 * 60000, readings: [{ remaining: 412.66, unit: '元' }, { remaining: 8.4, unit: 'USD' }] }
    }
  },
  balanceResults: [{ provider: 'p', key: 'a', status: 'ok' }, { provider: 'q', key: 'a', status: 'error' }],
  writeError: '',
  balanceError: ''
};

const source = readFileSync(clientPath, 'utf8');
const css = readFileSync(cssPath, 'utf8');

function renderTree(mode) {
  const states = [];
  let cursor = 0;
  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...(props || {}), children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children } }),
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) {
        if (initial === null && index === 0) states[index] = fixture;
        else if (initial === 'actual') states[index] = previewMode;
        else states[index] = typeof initial === 'function' ? initial() : initial;
      }
      return [states[index], () => {}];
    },
    useEffect() {},
    useCallback: fn => fn
  };
  const document = { querySelector: () => null, createElement: () => ({ dataset: {}, textContent: '' }), head: { appendChild: () => {} } };
  let component;
  const context = {
    window: { __ModuleLoader__: { load: ({ factory }) => { component = factory(name => (name === 'react' ? React : {})); } }, dispatchEvent: () => {} },
    document,
    fetch: async () => ({ ok: true, json: async () => fixture }),
    URL: { createObjectURL: () => 'blob:', revokeObjectURL: () => {} },
    Blob: class {}, Event: class {}, setInterval: () => 1, clearInterval: () => {},
    AbortController: class { constructor() { this.signal = {}; } abort() {} },
    console
  };
  context.window.document = document;
  vm.runInNewContext(source, context, { filename: 'spending-client.js' });
  let page;
  component.apply({ slots: { inject: (name, callback) => callback(), register: (options, fn) => { page = fn; return () => {}; } } });
  const Page = page({ view: 'page' }).type;
  // 让 mode 挂到 __forceMode 上由组件内的 useState('actual') 读取
  React.__mode = mode;
  const tree = Page({});
  return tree;
}

// 在组件里 mode 初始值是 'actual'；这里分别渲染两种口径。
const actualTree = renderTree('actual');

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
function toHtml(node) {
  if (node === null || node === undefined || node === false || node === true) return '';
  if (Array.isArray(node)) return node.map(toHtml).join('');
  if (typeof node === 'string' || typeof node === 'number') return escapeHtml(node);
  const { type, props = {} } = node;
  if (typeof type === 'function') return toHtml(type(props));
  const { children, ...attributes } = props;
  const name = String(type);
  const attrs = Object.entries(attributes).flatMap(([key, value]) => {
    if (value === undefined || value === null || value === false) return [];
    if (key === 'style' && typeof value === 'object') return [` style="${Object.entries(value).map(([prop, val]) => `${prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}:${val}`).join(';')}"`];
    if (key === 'className') return [` class="${escapeHtml(value)}"`];
    if (value === true) return [` ${key}`];
    return [` ${key}="${escapeHtml(value)}"`];
  }).join('');
  if (VOID.has(name)) return `<${name}${attrs}>`;
  return `<${name}${attrs}>${toHtml(children)}</${name}>`;
}

const body = toHtml(actualTree);

const page = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>消费总览 · 界面改版预览</title>
<style>
/* Harness 主题变量的浅色兜底值；深色由 [data-dark] 覆盖。 */
:root {
  --dsw-alias-bg-base: #ffffff;
  --dsw-alias-bg-layer-1: #ffffff;
  --dsw-alias-bg-layer-2: #f4f5f7;
  --dsw-alias-bg-layer-3: #e9ebee;
  --dsw-alias-bg-layer-4: #dfe2e6;
  --dsw-alias-border-l1: rgb(0 0 0 / 6%);
  --dsw-alias-border-l2: rgb(0 0 0 / 10%);
  --dsw-alias-border-l3: rgb(0 0 0 / 16%);
  --dsw-alias-border-l4: rgb(0 0 0 / 24%);
  --dsw-alias-label-primary: #0f1115;
  --dsw-alias-label-secondary: #61666b;
  --dsw-alias-label-tertiary: #81858c;
  --dsw-alias-label-primary-foreground: #ffffff;
  --dsw-alias-brand-primary: #3d6ef5;
  --dsw-alias-button-primary-hover: #5580f7;
  --dsw-alias-state-success-primary: #2fa36b;
  --dsw-alias-state-warn-primary: #d99a2b;
  --dsw-alias-state-warn-label: #9a6a14;
  --dsw-alias-state-error-primary: #d05252;
  --dsw-alias-interactive-bg-hover: rgb(15 17 21 / 5%);
  --dsw-alias-interactive-bg-hover-danger: rgb(208 82 82 / 12%);
  --dsw-alias-bg-mask-1: rgb(0 0 0 / 45%);
  --dsw-alias-tooltip-bg: #111418;
  --dsw-alias-toast-label: #f4f6f8;
  --dsw-elevation-prominent: 0 18px 48px rgb(0 0 0 / 18%);
}
[data-dark] {
  --dsw-alias-bg-base: #151517;
  --dsw-alias-bg-layer-1: #1b1c1f;
  --dsw-alias-bg-layer-2: #232427;
  --dsw-alias-bg-layer-3: #2c2d31;
  --dsw-alias-bg-layer-4: #35363b;
  --dsw-alias-border-l1: rgb(255 255 255 / 8%);
  --dsw-alias-border-l2: rgb(255 255 255 / 12%);
  --dsw-alias-border-l3: rgb(255 255 255 / 18%);
  --dsw-alias-border-l4: rgb(255 255 255 / 26%);
  --dsw-alias-label-primary: #f9fafb;
  --dsw-alias-label-secondary: #cfd3d6;
  --dsw-alias-label-tertiary: #adb2b8;
  --dsw-alias-label-primary-foreground: #ffffff;
  --dsw-alias-brand-primary: #5b86ff;
  --dsw-alias-button-primary-hover: #6d93ff;
  --dsw-alias-state-success-primary: #43c07f;
  --dsw-alias-state-warn-primary: #e6ad46;
  --dsw-alias-state-warn-label: #e6ad46;
  --dsw-alias-state-error-primary: #e2686a;
  --dsw-alias-interactive-bg-hover: rgb(255 255 255 / 7%);
  --dsw-alias-interactive-bg-hover-danger: rgb(226 104 106 / 16%);
  --dsw-alias-bg-mask-1: rgb(0 0 0 / 60%);
  --dsw-alias-tooltip-bg: #0c0e10;
  --dsw-alias-toast-label: #f4f6f8;
  --dsw-elevation-prominent: 0 20px 56px rgb(0 0 0 / 55%);
}
html, body { margin: 0; }
body {
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
}
.dsh-preview-bar {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 10px 20px;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 88%, transparent);
  backdrop-filter: blur(8px);
}
.dsh-preview-bar strong { font-size: 13px; }
.dsh-preview-bar span { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.dsh-preview-bar button {
  height: 30px; padding: 0 12px; border: 1px solid var(--dsw-alias-border-l3); border-radius: 999px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; cursor: pointer;
}
.dsh-preview-bar button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dsh-preview-stage { padding: 8px 0 40px; }
/* 预览里禁用真实交互，避免误以为按钮有效 */
.dsh-preview-stage button, .dsh-preview-stage select, .dsh-preview-stage input { pointer-events: auto; }
</style>
<style>
${css}
</style>
</head>
<body>
<div class="dsh-preview-bar">
  <strong>消费总览 · 界面改版预览</strong>
  <span>由 plugins/personal-toolbox/src/spending/client.js 真实渲染 + plugins/personal-toolbox/src/spending/style.css 生成（样例数据）</span>
  <span style="flex:1"></span>
  <button type="button" onclick="document.documentElement.toggleAttribute('data-dark')">切换浅色 / 深色</button>
</div>
<div class="dsh-preview-stage">
${body}
</div>
</body>
</html>
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, page);
console.log('preview written:', outputPath);
console.log('body bytes:', body.length);
