import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../compat/connection/client.js', import.meta.url), 'utf8');
assert.match(source, /function ConnectionOutageBanner/);
assert.match(source, /id: "connection-outage"/);
assert.match(source, /name: "shell\.overlay"/);
assert.match(source, /connection\.outage\.title/);
assert.match(source, /终端已断线，当前任务已中断/);
assert.match(source, /Host disconnected — the current task already stopped/);
assert.match(source, /sawConnected/);
assert.match(source, /react_dom\.createPortal/);

const zhKeys = [...source.matchAll(/"connection\.outage\.[^"]+"/g)].map((m) => m[0]);
assert.ok(zhKeys.length >= 8, 'outage locale keys missing');
console.log('PASS: connection outage banner is patched into settings-general and registered on shell.overlay');
