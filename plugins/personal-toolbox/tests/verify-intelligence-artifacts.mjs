import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { createIntelligenceArtifactHandler, revealIntelligenceArtifact } from '../src/shared/services.js';

if (process.platform === 'win32') {
  let detached = false;
  const selectedPath = 'E:\\folder with spaces\\动画.html';
  await revealIntelligenceArtifact(selectedPath, (program, args, options) => {
    assert.match(program, /explorer\.exe$/i);
    assert.deepEqual(args, ['/select,', selectedPath]);
    assert.equal(options.windowsHide, false, 'Explorer must create a visible user window');
    assert.equal(options.shell, false);
    const child = new EventEmitter();
    child.unref = () => { detached = true; };
    queueMicrotask(() => child.emit('spawn'));
    return child;
  });
  assert.equal(detached, true);
  await revealIntelligenceArtifact('E:\\folder with spaces', (_program, args, options) => {
    assert.deepEqual(args, ['E:\\folder with spaces']);
    assert.equal(options.windowsHide, false);
    const child = new EventEmitter(); child.unref = () => {};
    queueMicrotask(() => child.emit('spawn')); return child;
  }, false);
  await assert.rejects(revealIntelligenceArtifact(selectedPath, () => {
    const child = new EventEmitter();
    queueMicrotask(() => child.emit('error', new Error('Explorer unavailable')));
    return child;
  }), /Explorer unavailable/);
}

const directory = await mkdtemp(join(tmpdir(), 'dsh-artifact-test-'));
try {
  const revealed = [], folders = [];
  const handler = createIntelligenceArtifactHandler({ directory, reveal: async path => revealed.push(path), openDirectory: async path => folders.push(path) });
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="20"><animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite"/></circle></svg>';
  const save = (value) => handler(new Request('http://localhost/api/intelligence-artifact', { method: 'POST', body: JSON.stringify(value) }));
  const first = await save({ svg, title: '<script>alert(1)</script>' });
  assert.equal(first.status, 200);
  const artifact = await first.json();
  assert.equal(artifact.path, join(directory, artifact.name));
  const html = await readFile(artifact.path, 'utf8');
  assert.ok(html.includes(Buffer.from(svg).toString('base64')));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('Content-Security-Policy'));
  const duplicate = await (await save({ svg, title: '<script>alert(1)</script>' })).json();
  assert.equal(duplicate.path, artifact.path);
  assert.equal((await readdir(directory)).length, 1);
  assert.equal((await save({ action: 'reveal', id: artifact.id })).status, 200);
  assert.deepEqual(revealed, [artifact.path]);
  assert.equal((await save({ action: 'reveal', id: '../../secret', path: 'C:\\Windows' })).status, 400);
  assert.equal((await save({ action: 'reveal', id: '0'.repeat(64) })).status, 404);
  assert.equal(revealed.length, 1);
  const failingExplorer = createIntelligenceArtifactHandler({ directory, reveal: async () => { throw new Error('spawn failed'); } });
  const failedOpen = await failingExplorer(new Request('http://localhost/api/intelligence-artifact', { method: 'POST', body: JSON.stringify({ action: 'reveal', id: artifact.id }) }));
  assert.equal(failedOpen.status, 500);
  assert.match((await failedOpen.json()).error, /资源管理器/);
  const opened = await handler(new Request('http://localhost' + artifact.url));
  assert.equal(opened.status, 200);
  assert.equal(await opened.text(), html);
  assert.match(opened.headers.get('content-security-policy'), /^sandbox allow-scripts;/);
  assert.equal((await handler(new Request('http://localhost/api/intelligence-artifact?id=../../secret'))).status, 400);
  assert.equal((await handler(new Request('http://localhost/api/intelligence-artifact?id=' + '0'.repeat(64)))).status, 404);
  assert.equal((await save({ svg: '<html>bad</html>' })).status, 400);
  assert.equal((await save(null)).status, 400);
  assert.equal((await save({ svg: 'x'.repeat(4 * 1024 * 1024) })).status, 413);
  const hostile = '<svg><script>alert(1)</script><foreignObject><iframe src="http://example.org"/></foreignObject></svg>';
  const hostileArtifact = await (await save({ svg: hostile })).json();
  const isolated = await readFile(hostileArtifact.path, 'utf8');
  assert.ok(!isolated.includes('<script>') && !isolated.includes('<iframe'));
  assert.ok(isolated.includes(Buffer.from(hostile).toString('base64')));
  const original = '<!DOCTYPE html>\n<html><style>body{background:pink}</style><script>document.title="original"</script><svg><circle r="20"/></svg></html>';
  const originalArtifact = await (await save({html:original})).json();
  assert.equal(await readFile(originalArtifact.path,'utf8'), original);
  assert.equal(await (await handler(new Request('http://localhost'+originalArtifact.url))).text(), original);

  // Exercise the real button callback: browsing must not re-export deleted history.
  const source = await readFile(new URL('../src/intelligence/client.js', import.meta.url), 'utf8');
  const start = source.indexOf('const openGeneratedFolder = async () => {');
  const buttonSource = source.slice(start, source.indexOf('const copyPrompt =', start));
  const bodies = [], states = [], messages = [];
  const click = new Function('fetch', 'openingFilesRef', 'setOpeningFiles', 'setToast', buttonSource + ';return openGeneratedFolder;')(
    async (url, init) => { assert.equal(url, '/api/intelligence-artifact'); bodies.push(JSON.parse(init.body)); return handler(new Request('http://localhost' + url, init)); },
    { current: false }, value => states.push(value), value => messages.push(value)
  );
  await rm(originalArtifact.path);
  const remaining = await readdir(directory);
  await click(); await click();
  assert.deepEqual(await readdir(directory), remaining);
  assert.deepEqual(bodies, [{ action: 'open-folder' }, { action: 'open-folder' }]);
  assert.deepEqual(folders, [directory, directory]);
  assert.deepEqual(states, [true, false, true, false]);
  assert.deepEqual(messages, []);
  assert.equal((await handler(new Request('http://localhost' + originalArtifact.url))).status, 404);
  const emptyDirectory = join(directory, 'new-empty-folder');
  const emptyHandler = createIntelligenceArtifactHandler({ directory: emptyDirectory, openDirectory: async path => assert.equal(path, emptyDirectory) });
  assert.equal((await emptyHandler(new Request('http://localhost/api/intelligence-artifact', { method: 'POST', body: JSON.stringify({ action: 'open-folder' }) }))).status, 200);
  assert.deepEqual(await readdir(emptyDirectory), []);
  const brokenFolder = createIntelligenceArtifactHandler({ directory, openDirectory: async () => { throw Error('no Explorer'); } });
  assert.equal((await brokenFolder(new Request('http://localhost/api/intelligence-artifact', { method: 'POST', body: JSON.stringify({ action: 'open-folder' }) }))).status, 500);
  console.log('PASS: file persistence, animated SVG roundtrip, reveal saved file only, Explorer failure, deduplication, input validation, traversal rejection, and isolated HTML. No model calls.');
} finally {
  await rm(directory, { recursive: true, force: true });
}
