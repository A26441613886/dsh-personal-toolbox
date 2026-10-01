// Builds a real-browser regression for playwright-cli run-code --filename.
// Uses an isolated, routed origin; never opens Harness or calls a model.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const source = await readFile(new URL('../src/intelligence/client.js', import.meta.url), 'utf8');
const slice = (a, b) => source.slice(source.indexOf(a), source.indexOf(b, source.indexOf(a)));
const code = `const INTELLIGENCE_WORKBENCH_HISTORY_KEY = 'history-test';
const normalizeIntelligenceRecord = item => item;
function readIntelligenceWorkbenchHistory() { return JSON.parse(localStorage.getItem(INTELLIGENCE_WORKBENCH_HISTORY_KEY) || '[]'); }
${slice('function writeIntelligenceWorkbenchHistory(', 'function intelligenceModelKey(')}
${slice('function createIntelligenceRunner(', 'function IntelligenceModelPicker(')}
return { createIntelligenceRunner, intelligenceHistoryDatabase };`;
const script = async page => {
  const sourceCode = SOURCE_CODE;
  await page.route('http://127.0.0.1:4199/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Isolated history regression</title>' }));
  await page.goto('http://127.0.0.1:4199/history-test');
  const initialize = async () => page.evaluate(code => {
    window.testApi = new Function(code)();
    window.check = (ok, message) => { if (!ok) throw new Error(message); };
    window.target = { id: 'test', providerId: 'p', modelId: 'm' };
    window.verdict = { score: 1, max: 1, valid: true, passed: true, verdict: { label: 'normal', tone: 'good' } };
  }, sourceCode);
  await initialize();
  const first = await page.evaluate(async () => {
    // Reset ONLY this isolated test origin.
    localStorage.clear();
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('dsh.local.intelligenceHistory.v1');
      request.onsuccess = resolve; request.onerror = reject;
    });
    const legacy = JSON.stringify([{ id: 'legacy', targetId: 'test', raw: 'old full reply' }]);
    localStorage.setItem('history-test', legacy);
    const runner = testApi.createIntelligenceRunner();
    await runner.flushHistory();
    check(runner.getSnapshot().history[0].id === 'legacy', 'legacy migration');
    check((await testApi.intelligenceHistoryDatabase('readonly'))[0].raw === 'old full reply', 'legacy persisted');
    let quotaReached = false;
    try { for (let i = 0; i < 100; i++) localStorage.setItem('quota-' + i, 'x'.repeat(256 * 1024)); }
    catch (error) { quotaReached = error.name === 'QuotaExceededError'; }
    check(quotaReached, 'must reproduce real localStorage quota');
    runner.record(target, 'A'.repeat(6 * 1024 * 1024), verdict, true, { id: 'large', questions: [{ mode: 'pelican', retryCount: 3, attemptHistory: [1, 2, 3].map(attempt => ({ attempt, partialRaw: 'partial-' + attempt + 'x'.repeat(3000), responseBlocks: [{ type: 'reasoning', text: 'thought-' + attempt }] })) }] });
    for (let i = 0; i < 8; i++) runner.record(target, 'reply-' + i, verdict, true, { id: 'parallel-' + i });
    await runner.flushHistory();
    check(!runner.getSnapshot().historyError, 'IndexedDB must bypass localStorage quota');
    check(localStorage.getItem('history-test') === legacy, 'legacy must remain untouched');
    const saved = await testApi.intelligenceHistoryDatabase('readonly');
    check(saved.length === 10 && saved[0].id === 'parallel-7', 'ordered writes keep all records');
    check(saved.find(x => x.id === 'large').raw.length === 6 * 1024 * 1024, 'large reply intact');
    return { quotaReached, records: saved.length, largeReplyBytes: saved.find(x => x.id === 'large').raw.length };
  });
  await page.reload();
  await initialize();
  await page.evaluate(async () => {
    const runner = testApi.createIntelligenceRunner();
    // Before async hydration completes, add a new record.
    runner.record(target, 'arrived during load', verdict, true, { id: 'early' });
    await runner.flushHistory();
    const saved = runner.getSnapshot().history;
    check(saved.length === 11 && saved[0].id === 'early', 'hydration must merge in-flight additions');
    check(saved.find(x => x.id === 'large').raw.length === 6 * 1024 * 1024, 'reload keeps complete reply');
    const attempts = saved.find(x => x.id === 'large').questions[0].attemptHistory;
    check(attempts.length === 3 && attempts[2].partialRaw === 'partial-3' + 'x'.repeat(3000) && attempts[0].responseBlocks[0].text === 'thought-1', 'reload keeps independent retry content and reasoning');
    const clearing = testApi.createIntelligenceRunner();
    clearing.clearHistory();
    await clearing.flushHistory();
    check((await testApi.intelligenceHistoryDatabase('readonly')).length === 0, 'early clear must persist');
  });
  await page.reload();
  await initialize();
  await page.evaluate(async code => {
    const runner = testApi.createIntelligenceRunner();
    await runner.flushHistory();
    check(runner.getSnapshot().history.length === 0, 'empty database must not resurrect legacy backup');
    // Inject storage faults into actual runner to verify non-destructive handling.
    let writes = 0;
    const failedRead = new Function('fault', code.replace('return { createIntelligenceRunner, intelligenceHistoryDatabase };', 'intelligenceHistoryDatabase = fault; return { createIntelligenceRunner };'))(async mode => {
      if (mode === 'readwrite') writes++;
      throw new Error('read denied');
    }).createIntelligenceRunner();
    failedRead.record(target, 'retained in memory', verdict, true, { id: 'unsaved' });
    await failedRead.flushHistory();
    check(writes === 0, 'failed read must never overwrite unread history');
    check(failedRead.getSnapshot().history[0].id === 'unsaved' && /读取失败/.test(failedRead.getSnapshot().historyError), 'read failure retains fresh result and warning');
    let failWrite = true;
    const storage = testApi.intelligenceHistoryDatabase;
    const failedWrite = new Function('fault', code.replace('return { createIntelligenceRunner, intelligenceHistoryDatabase };', 'intelligenceHistoryDatabase = fault; return { createIntelligenceRunner };'))(async (mode, value) => {
      if (mode === 'readwrite' && failWrite) throw new DOMException('full', 'QuotaExceededError');
      return storage(mode, value);
    }).createIntelligenceRunner();
    await failedWrite.flushHistory();
    failedWrite.record(target, 'new reply', verdict, true, { id: 'retry-me' });
    await failedWrite.flushHistory();
    check(/空间不足/.test(failedWrite.getSnapshot().historyError), 'write failure visible');
    check((await storage('readonly')).length === 0, 'failed transaction keeps prior database');
    failWrite = false;
    failedWrite.record(target, 'next reply', verdict, true, { id: 'retry-success' });
    await failedWrite.flushHistory();
    check(!failedWrite.getSnapshot().historyError, 'later commit recovers');
    const saved = await storage('readonly');
    check(saved.length === 2 && saved[1].id === 'retry-me', 'recovery saves both memory results');
  }, sourceCode);
  return { passed: true, ...first, checks: ['migration', 'quota', 'ordered writes', 'reload', 'early add/clear', 'no resurrection', 'read failure protection', 'write failure recovery'] };
};
await mkdir(new URL('../../../output/playwright/', import.meta.url), { recursive: true });
await writeFile(new URL('../../../output/playwright/verify-intelligence-history.cjs', import.meta.url), script.toString().replace('SOURCE_CODE', JSON.stringify(code)));
console.log('Generated output/playwright/verify-intelligence-history.cjs');
