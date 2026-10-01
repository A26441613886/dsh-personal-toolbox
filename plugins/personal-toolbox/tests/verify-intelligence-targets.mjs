import { readFile, mkdir, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/intelligence/client.js', import.meta.url), 'utf8');
const start = source.indexOf('function updateIntelligenceTargets(change)');
const end = source.indexOf('function writeIntelligenceWorkbenchHistory(', start);
if (start < 0 || end < start) throw new Error('Target storage implementation not found');
const code = `const INTELLIGENCE_TARGETS_KEY = 'dsh.local.intelligenceTargets.v2';\n${source.slice(start, end)}\nreturn updateIntelligenceTargets;`;
const script = async page => {
  await page.route('http://127.0.0.1:4199/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Isolated target storage test</title>' }));
  await page.goto('http://127.0.0.1:4199/targets');
  const result = await page.evaluate(async sourceCode => {
    const update = new Function(sourceCode)();
    const target = id => ({ id, name: id, mode: 'combined' });
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    localStorage.setItem('dsh.local.intelligenceTargets.v2', JSON.stringify([target('legacy')]));
    const original = await update();
    check(original.length === 1 && original[0].id === 'legacy', 'legacy list migrated');
    const legacyBackup = localStorage.getItem('dsh.local.intelligenceTargets.v2');
    let quotaReached = false;
    try { for (let i = 0; i < 100; i++) localStorage.setItem('quota-' + i, 'x'.repeat(256 * 1024)); }
    catch (error) { quotaReached = error.name === 'QuotaExceededError'; }
    check(quotaReached, 'localStorage quota reproduced');
    await update(current => [...current, target('new')]);
    await update(current => [...current, target('other-window')]);
    const saved = await update();
    check(saved.map(item => item.id).join(',') === 'legacy,new,other-window', 'transaction retains other window additions');
    check(localStorage.getItem('dsh.local.intelligenceTargets.v2') === legacyBackup, 'legacy backup untouched');
    return { quotaReached, targets: saved.map(item => item.id) };
  }, SOURCE_CODE);
  await page.reload();
  await page.evaluate(async sourceCode => {
    const update = new Function(sourceCode)();
    const saved = await update();
    if (saved.map(item => item.id).join(',') !== 'legacy,new,other-window') throw new Error('reloaded targets missing');
  }, SOURCE_CODE);
  return { passed: true, ...result };
};
await mkdir(new URL('../../../output/playwright/', import.meta.url), { recursive: true });
await writeFile(new URL('../../../output/playwright/verify-intelligence-targets.cjs', import.meta.url), script.toString().replaceAll('SOURCE_CODE', JSON.stringify(code)));
console.log('Generated output/playwright/verify-intelligence-targets.cjs');
