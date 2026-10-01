import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { webcrypto } from 'node:crypto';
import { createIntelligenceTestHandler, createIntelligenceArtifactHandler } from '../src/shared/services.js';

const source = await readFile(new URL('../src/intelligence/client.js', import.meta.url), 'utf8');
const slice = (a, b) => source.slice(source.indexOf(a), source.indexOf(b, source.indexOf(a)));
const directory = await mkdtemp(join(tmpdir(), 'dsh-fresh-results-'));
try {
  const artifactHandler = createIntelligenceArtifactHandler({ directory });
  const calls = [], saves = [];
  let pelicanText = '<!doctype html><html><body><svg><text>first</text></svg></body></html>';
  let failPelican = false, failSave = false, quotaFull = false, releaseCandy;
  let replayResponseId = null;
  const llm = { async *stream(options) {
    calls.push(options);
    const candy = options.messages[0].content[0].text === 'candy prompt';
    if (candy && releaseCandy !== undefined) await new Promise(resolve => { releaseCandy = resolve; });
    if (!candy && failPelican) throw new Error('upstream failed');
    yield { type: 'text-delta', index: 0, text: candy ? '21' : pelicanText };
    yield { type: 'finish', reason: { kind: 'stop' }, replayState: { response: { responseId: replayResponseId || `response-${calls.length}-${candy ? 'candy' : 'pelican'}` } } };
  } };
  const testHandler = createIntelligenceTestHandler(llm);
  const mockFetch = async (url, init) => {
    assert.equal(init.cache, 'no-store');
    const request = new Request('http://localhost' + url, init);
    if (url === '/api/intelligence-test') return testHandler(request);
    saves.push(JSON.parse(init.body));
    if (failSave) return Response.json({ error: 'disk read only' }, { status: 500 });
    return artifactHandler(request);
  };
  const storage = new Map();
  const context = vm.createContext({
    crypto: webcrypto, AbortController, AbortSignal, TextDecoder, Date,
    window: { setInterval, clearInterval, setTimeout, clearTimeout },
    INTELLIGENCE_WORKBENCH_HISTORY_KEY: 'history',
    localStorage: { setItem(k, v) { if (quotaFull) throw new Error('quota'); storage.set(k, v); } },
    readIntelligenceWorkbenchHistory: () => JSON.parse(storage.get('history') || '[]'),
    getIntelligencePrompt: mode => mode + ' prompt',
  });
  const code = slice('function intelligenceResultStatus(', 'function buildIntelligenceTimeline(')
    + slice('function writeIntelligenceWorkbenchHistory(', 'function intelligenceModelKey(')
    + slice('function prepareIntelligenceSvg(', 'function IntelligenceModelPicker(');
  const createRunner = vm.runInContext(code + ';createIntelligenceRunner', context);
  const runner = createRunner(mockFetch);
  const target = { id: 'one', providerId: 'provider', modelId: 'model', name: 'Test', mode: 'combined' };

  // File must exist as soon as the pelican finishes, while the other question is pending.
  releaseCandy = null;
  let resolveSaved;
  const saved = new Promise(resolve => { resolveSaved = resolve; });
  const unsubscribe = runner.subscribe(() => {
    if (runner.getSnapshot().progress.one?.questions.find(q => q.mode === 'pelican')?.artifact) resolveSaved();
  });
  const running = runner.run(target);
  await saved;
  assert.equal((await readdir(directory)).length, 1);
  assert.equal(runner.getSnapshot().running.length, 1);
  assert.equal(runner.getSnapshot().progress.one.questions.find(q => q.mode === 'candy').pending, true);
  releaseCandy();
  await running;
  releaseCandy = undefined;
  unsubscribe();
  const first = runner.getSnapshot().history[0];
  assert.equal(await readFile(first.questions[0].artifact.path, 'utf8'), pelicanText);

  // Same prompt/HTML still creates a new upstream call and distinct artifact for the new run.
  await runner.run(target);
  const second = runner.getSnapshot().history[0];
  assert.equal(calls.length, 4);
  assert.notEqual(first.id, second.id);
  assert.notEqual(first.questions[0].artifact.path, second.questions[0].artifact.path);
  assert.equal((await readdir(directory)).length, 2);
  const retry = await artifactHandler(new Request('http://localhost/api/intelligence-artifact', { method: 'POST', body: JSON.stringify(saves[1]) }));
  assert.equal((await retry.json()).path, second.questions[0].artifact.path);
  assert.equal((await readdir(directory)).length, 2);

  // Quota failure must not restore the previous preview when a new run finishes.
  quotaFull = true;
  pelicanText = pelicanText.replace('first', 'new result');
  await runner.run(target);
  const fresh = runner.getSnapshot();
  assert.equal(fresh.history[0].preview, pelicanText);
  assert.match(fresh.historyError, /保存失败/);
  assert.equal(JSON.parse(storage.get('history'))[0].id, second.id, 'Existing stored history preserved');
  assert.equal(await readFile(fresh.history[0].questions[0].artifact.path, 'utf8'), pelicanText);

  // A failed file save preserves the new reply and does not fail the model test.
  failSave = true;
  await runner.run(target);
  const diskFailure = runner.getSnapshot().history[0];
  assert.equal(diskFailure.preview, pelicanText);
  assert.equal(diskFailure.questions[0].passed, true);
  assert.match(diskFailure.questions[0].artifactError, /disk read only/);

  // An explicit file retry uses the existing run, never re-generates either answer.
  const modelCallsBeforeRetry = calls.length, savesBeforeRetry = saves.length;
  failSave = false;
  await Promise.all([runner.retryArtifact(diskFailure.id), runner.retryArtifact(diskFailure.id)]);
  const savedRetry = runner.getSnapshot().history.find(item => item.id === diskFailure.id);
  assert.equal(calls.length, modelCallsBeforeRetry);
  assert.equal(saves.length, savesBeforeRetry + 1, 'Double click writes only once');
  assert.equal(savedRetry.questions[0].artifactError, '');
  assert.equal(savedRetry.questions[0].artifactSaving, false);
  assert.equal(savedRetry.questions[0].raw, diskFailure.questions[0].raw);
  assert.equal(savedRetry.questions[0].preview, diskFailure.questions[0].preview);
  assert.equal(savedRetry.at, diskFailure.at, 'Retry does not become a new test');
  assert.equal(saves.at(-1).runId, diskFailure.runId);
  assert.equal(await readFile(savedRetry.questions[0].artifact.path, 'utf8'), pelicanText);
  await rm(savedRetry.questions[0].artifact.path);
  await runner.retryArtifact(diskFailure.id);
  assert.equal(saves.length, savesBeforeRetry + 1, 'Successful records/deleted files are never implicitly re-exported');

  // A new upstream failure has no old HTML fallback; the other question still completes.
  failPelican = true;
  await runner.run(target);
  const failed = runner.getSnapshot().history[0];
  assert.equal(failed.preview, '');
  assert.equal(failed.questions[0].completed, false);
  assert.equal(failed.questions[1].answer, 21);
  assert.equal(calls.length, 10);
  assert.ok(calls.every(call => call.messages.length === 1 && !call.tools && !call.system));

  // Reused upstream IDs must not turn a valid, newly returned answer into a failure.
  failPelican = false; failSave = false; quotaFull = false;
  replayResponseId = first.questions[0].upstreamResponseId;
  await runner.run(target);
  const reusedId = runner.getSnapshot().history[0].questions[0];
  assert.equal(reusedId.cacheEvidence, 'same-id');
  assert.equal(reusedId.passed, true);
  assert.equal(reusedId.completed, true);
  assert.equal(reusedId.preview, pelicanText);
  assert.equal(await readFile(reusedId.artifact.path, 'utf8'), pelicanText);
  assert.match(reusedId.cacheWarning, /正文不同/);
  await runner.run(target);
  const reusedBody = runner.getSnapshot().history[0].questions[0];
  assert.equal(reusedBody.cacheEvidence, 'same-id-and-body');
  assert.equal(reusedBody.passed, true);
  assert.equal(reusedBody.raw, pelicanText);
  assert.match(reusedBody.cacheWarning, /无法确认/);
  assert.notEqual(reusedBody.artifact.path, reusedId.artifact.path);
  // Answer equality alone does not indicate response replay (especially a numeric answer).
  replayResponseId = null;
  await runner.run(target);
  assert.ok(runner.getSnapshot().history[0].questions.every(q => !q.cacheWarning && q.passed));
  // Providers that omit response IDs remain supported, without claiming freshness.
  const noIdRunner = createRunner(async (url, init) => {
    const response = await mockFetch(url, init);
    if (url !== '/api/intelligence-test') return response;
    const body = await response.text();
    return new Response(body.split(String.fromCharCode(10)).filter(Boolean).map(line => {
      const event = JSON.parse(line); delete event.upstreamResponseId; return JSON.stringify(event);
    }).join(String.fromCharCode(10)) + String.fromCharCode(10), { headers: { 'content-type': 'application/x-ndjson' } });
  });
  await noIdRunner.run(target);
  assert.ok(noIdRunner.getSnapshot().history[0].questions.every(q => !q.cacheWarning && q.passed));
  noIdRunner.dispose();

  // Changed IDs do not hide an identical long answer. Short numeric agreement alone is not evidence.
  const evidence = vm.runInContext('intelligenceFreshnessEvidence', context);
  const longBody = '模型实际返回的长篇推理正文。'.repeat(40);
  const prior = [{ mode: 'candy', raw: longBody, upstreamResponseId: 'before', requestId: 'round-before', completedAt: 100 }];
  const duplicate = evidence({ raw: longBody, upstreamResponseId: 'after' }, prior, 'candy');
  assert.equal(duplicate.cacheEvidence, 'same-body');
  assert.equal(duplicate.duplicateOf.requestId, 'round-before');
  assert.match(duplicate.cacheWarning, /逐字相同/);
  assert.equal(evidence({ raw: longBody }, prior, 'candy').cacheEvidence, 'same-body');
  assert.equal(evidence({ raw: longBody + ' 新内容', upstreamResponseId: 'after' }, prior, 'candy').cacheEvidence, null);
  assert.equal(evidence({ raw: '29', upstreamResponseId: 'after' }, [{ mode: 'candy', raw: '29', upstreamResponseId: 'before' }], 'candy').cacheEvidence, null);
  assert.equal(evidence({ raw: longBody, upstreamResponseId: 'before' }, prior, 'pelican').cacheEvidence, null);
  assert.equal(evidence({ raw: longBody, upstreamResponseId: 'before' }, [{ mode: 'candy', code: 'UPSTREAM_RESPONSE_REUSED', partialRaw: longBody, upstreamResponseId: 'before' }], 'candy').cacheEvidence, 'same-id-and-body');
  assert.equal(evidence({ raw: longBody, upstreamResponseId: 'after' }, prior, 'candy').duplicateOf.at, 100);

  // Cached/mismatched local HTTP responses must never become a new success or artifact.
  for (const identity of [{}, { requestId: 'old-request', provider: 'provider', model: 'model' }]) {
    let artifactCalls = 0;
    const staleRunner = createRunner(async (url, init) => {
      if (url !== '/api/intelligence-test') artifactCalls++;
      return Response.json({ ...identity, raw: JSON.parse(init.body).mode === 'candy' ? '21' : pelicanText });
    });
    await staleRunner.run(target);
    assert.ok(staleRunner.getSnapshot().history[0].questions.every(q => !q.completed && !q.passed));
    assert.equal(artifactCalls, 0);
    staleRunner.dispose();
  }
  runner.dispose();
  console.log('PASS: fresh independent calls, immediate file persistence, run isolation, idempotent export, quota failure preserves newest result, save/upstream failure separation. No live model calls.');
} finally {
  await rm(directory, { recursive: true, force: true });
}
