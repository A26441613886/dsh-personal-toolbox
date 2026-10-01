// Local accounting only: no prompts, responses, credentials or URLs are stored.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

export const spendingPath = () => join(process.env.DSH_HOME?.trim() || join(homedir(), '.dsh'), 'personal-spending.sqlite');
export const dayOf = (at = Date.now()) => {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const readSection = (settings, ns) => typeof settings.get === 'function' ? settings.get(ns) : settings.describe().find(row => row.ns === ns)?.value;
export function spendingProviders(settings) {
  const pi = readSection(settings, 'llm-pi-ai')?.providers || {};
  const official = readSection(settings, 'llm-deepseek');
  return [...Object.entries(pi), ...(official ? [['deepseek-official', official]] : [])].map(([id, p]) => {
    const keys = Array.isArray(p.apiKeys) && p.apiKeys.length ? p.apiKeys.map(k => ({ id: k.id, name: k.name || k.id })) : [{ id: 'legacy-default', name: '默认密钥' }];
    const requestKey = id === 'deepseek-official' ? p.apiKeys?.find(k => k.credentialRef === (p.apiKeyEnv || 'DEEPSEEK_API_KEY'))?.id || 'legacy-default' : keys.find(k => k.id === p.activeApiKey)?.id || keys[0].id;
    return { id, name: p.displayName || (id === 'deepseek-official' ? 'DeepSeek 官方' : id), enabled: p.enabled !== false, requestKey,
      defaultKey: keys.find(k => k.id === p.activeApiKey)?.id || keys[0].id, keys,
      models: (p.models || []).map(m => ({ id: m.id, name: m.name || m.upstreamModelId || m.id, upstream: m.upstreamModelId || m.id, key: m.apiKey })) };
  });
}
export function usageIdentity(settings, options) {
  const p = spendingProviders(settings).find(p => p.id === options.provider);
  const m = p?.models.find(m => m.id === options.model);
  const key = (p?.id !== 'deepseek-official' ? p?.keys.find(k => k.id === m?.key) : undefined) || p?.keys.find(k => k.id === p.requestKey);
  return { provider: String(options.provider), providerName: p?.name || String(options.provider), model: String(options.model), modelName: m?.name || String(options.model), key: key?.id || 'legacy-default', keyName: key?.name || '默认密钥', source: options.intelligenceRequestId ? 'intelligence' : options.sessionId ? 'chat' : 'other' };
}
const count = n => Number.isFinite(n) && n >= 0 ? n : 0;
export function openSpendingStore(file = spendingPath()) {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  try {
    db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=3000;
      CREATE TABLE IF NOT EXISTS usage_day (
        day TEXT NOT NULL, provider TEXT NOT NULL, model TEXT NOT NULL, key_id TEXT NOT NULL, source TEXT NOT NULL,
        provider_name TEXT, model_name TEXT, key_name TEXT, calls INTEGER NOT NULL, missing INTEGER NOT NULL,
        input REAL NOT NULL, output REAL NOT NULL, cache_read REAL NOT NULL, cache_write REAL NOT NULL, failures INTEGER NOT NULL,
        PRIMARY KEY(day,provider,model,key_id,source));
      CREATE TABLE IF NOT EXISTS prices (provider TEXT NOT NULL, model TEXT NOT NULL, key_id TEXT NOT NULL, unit TEXT NOT NULL,
        input REAL NOT NULL, output REAL NOT NULL, cache_read REAL NOT NULL, cache_write REAL NOT NULL, PRIMARY KEY(provider,model,key_id));
      CREATE TABLE IF NOT EXISTS preferences (provider TEXT PRIMARY KEY, key_id TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
    db.prepare('INSERT OR IGNORE INTO metadata VALUES (?,?)').run('startedAt', String(Date.now()));
  } catch (error) { db.close(); throw error; }
  return {
    close: () => db.close(),
    record(identity, usage, failed = false, at = Date.now()) {
      const valid = usage && Number.isFinite(usage.inputTokens) && usage.inputTokens >= 0 && Number.isFinite(usage.outputTokens) && usage.outputTokens >= 0;
      const u = valid ? usage : {};
      db.prepare(`INSERT INTO usage_day VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(day,provider,model,key_id,source) DO UPDATE SET
        provider_name=excluded.provider_name, model_name=excluded.model_name, key_name=excluded.key_name,
        calls=calls+1, missing=missing+excluded.missing, input=input+excluded.input, output=output+excluded.output,
        cache_read=cache_read+excluded.cache_read, cache_write=cache_write+excluded.cache_write, failures=failures+excluded.failures`)
        .run(dayOf(at), identity.provider, identity.model, identity.key, identity.source, identity.providerName, identity.modelName, identity.keyName,
          1, valid ? 0 : 1, count(u.inputTokens), count(u.outputTokens), count(u.cacheReadTokens), count(u.cacheWriteTokens), failed ? 1 : 0);
    },
    snapshot() {
      return { rows: db.prepare('SELECT * FROM usage_day ORDER BY day DESC,provider,model,key_id').all(), prices: db.prepare('SELECT * FROM prices').all(),
        preferences: db.prepare('SELECT * FROM preferences').all(), startedAt: Number(db.prepare("SELECT value FROM metadata WHERE key='startedAt'").get().value) };
    },
    price(body) {
      for (const key of ['provider', 'model', 'key_id', 'unit']) if (typeof body[key] !== 'string' || !body[key].trim() || body[key].length > (key === 'unit' ? 12 : 256)) throw Error('请填写供应商、模型、密钥和币种');
      const values = ['input', 'output', 'cache_read', 'cache_write'].map(key => {
        if (body[key] === '' || body[key] == null) throw Error('请完整填写四种单价；免费项目请填 0');
        const n = Number(body[key]); if (!Number.isFinite(n) || n < 0 || n > 1e9) throw Error('单价必须是非负数字'); return n;
      });
      db.prepare('INSERT OR REPLACE INTO prices VALUES (?,?,?,?,?,?,?,?)').run(body.provider, body.model, body.key_id, body.unit.trim(), ...values);
    },
    selectKey(provider, key) { db.prepare('INSERT OR REPLACE INTO preferences VALUES (?,?)').run(provider, key); }
  };
}

export function observeSpending(next, identity, record) {
  return (async function* () {
    let usage, failed = true;
    try {
      for await (const chunk of next()) {
        if (chunk.type === 'usage') usage = chunk.usage; // cumulative snapshot, never sum repeated chunks
        if (chunk.type === 'finish') failed = ['error', 'aborted'].includes(chunk.reason?.kind);
        yield chunk;
      }
    } finally { record(identity, usage, failed); }
  })();
}

export function applySpending(ctx, { balance, historyFile, file, sampleInterval = 300000 } = {}) {
  let store, writeError = '', stopped = false;
  const getStore = () => store ||= openSpendingStore(file);
  let refreshing, balanceResults = [];
  const refresh = (force = false) => refreshing ||= (async () => {
    const providers = spendingProviders(ctx.settings), prefs = getStore().snapshot().preferences, results = [];
    let index = 0;
    await Promise.all(Array.from({ length: Math.min(3, providers.length) }, async () => {
      while (index < providers.length && !stopped) {
        const p = providers[index++], chosen = prefs.find(v => v.provider === p.id)?.key_id;
        if (chosen === '__exclude__') continue;
        const key = p.keys.some(k => k.id === chosen) ? chosen : p.defaultKey;
        if (!p.enabled) { results.push({ provider: p.id, key, status: 'unavailable', reason: 'disabled' }); continue; }
        try { results.push({ provider: p.id, key, ...await balance(p.id, key, force) }); }
        catch { results.push({ provider: p.id, key, status: 'error', reason: 'query' }); }
      }
    }));
    balanceResults = results;
    return results;
  })().finally(() => { refreshing = undefined; });
  // No model calls: sample existing balance recipes while this component runs.
  ctx.effect(() => {
    if (!sampleInterval) return () => {};
    const timer = setInterval(() => { if (!stopped) refresh().catch(() => { writeError = '余额自动记录失败，请手动刷新检查'; }); }, sampleInterval);
    timer.unref?.();
    return () => clearInterval(timer);
  }, 'personal-customizations: balance sampling');
  ctx.on('llm/stream', (options, next) => {
    if (stopped) return next();
    let identity;
    try { identity = usageIdentity(ctx.settings, options); } catch { writeError = '用量归属读取失败，本次未记账'; return next(); }
    return observeSpending(next, identity, (...args) => {
      if (stopped) return;
      try { getStore().record(...args); } catch { writeError = '用量写入失败；本次记录可能缺失，请导出备份并检查磁盘'; }
    });
  }, { global: true });
  ctx.effect(() => () => { stopped = true; store?.close(); store = undefined; }, 'personal-customizations: spending ledger');
  const reply = (data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
  ctx.connection.fetch.register({ path: '/api/personal-spending', methods: ['GET', 'POST'], requestBody: 'buffered', fetch: async request => {
    if (stopped) return reply({ error: '消费总览组件已关闭' }, 503);
    try {
      const providers = spendingProviders(ctx.settings);
      if (request.method === 'POST') {
        const text = await request.text(); if (text.length > 16384) return reply({ error: '请求过大' }, 400);
        const body = JSON.parse(text);
        if (body.action === 'price') getStore().price(body);
        else if (body.action === 'key') {
          if (!providers.some(p => p.id === body.provider && (body.key === '__exclude__' || p.keys.some(k => k.id === body.key)))) throw Error('该供应商或密钥已不存在');
          getStore().selectKey(body.provider, body.key);
        } else if (body.action === 'refresh') {
          return reply({ results: await refresh(true) });
        } else return reply({ error: '未知操作' }, 400);
      }
      let ledger = {}, balanceError = '';
      try {
        ledger = JSON.parse(await readFile(historyFile, 'utf8'));
        if (!ledger || typeof ledger !== 'object' || Array.isArray(ledger)) throw Error('invalid');
      } catch (error) { if (error.code !== 'ENOENT') balanceError = '旧余额账本读取失败，原文件未修改'; }
      if (balanceResults.some(r => r.historyError)) balanceError = '余额已查询，但消费历史写入失败；请检查磁盘并导出已有账本';
      return reply({ ...getStore().snapshot(), providers, ledger, balanceResults, writeError, balanceError, today: dayOf() });
    } catch (error) {
      return reply({ error: /[\u4e00-\u9fff]/.test(error.message) ? error.message : '本机消费账本读取或保存失败，原数据未清空；请检查磁盘和后台版本' }, 400);
    }
  } });
}
