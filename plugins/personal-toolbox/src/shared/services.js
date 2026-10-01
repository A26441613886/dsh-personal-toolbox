import z from "@deepseek-ai/schemastery";
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, unlink, lstat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { applySpending } from '../spending/host.js';

export const Config = z.object({});
const name = 'personal-customizations';
function readProviderSettings(settings, ns) {
  return typeof settings.get === 'function' ? settings.get(ns) : settings.describe().find(entry => entry.ns === ns)?.value;
}
const inject = ['connection', 'settings', 'credentials', 'llm'];

export function validateQuery(raw) {
  const type = raw?.type;
  if (!['auto', 'off', 'deepseek', 'newapi', 'general', 'custom'].includes(type)) throw new Error('请选择查询类型');
  if (type === 'auto' || type === 'off') return { type };
  let url;
  try { url = new URL(raw.url); } catch { throw new Error('请填写完整的 HTTPS 查询地址'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) throw new Error('查询地址必须使用 HTTPS，不能包含用户名、密码或片段');
  if (url.href.length > 2048) throw new Error('查询地址过长');
  if (!['apiKey', 'custom', 'none'].includes(raw.auth)) throw new Error('请选择认证方式');
  const interval = Number(raw.interval), divisor = Number(raw.divisor ?? 1);
  if (!Number.isInteger(interval) || interval < 60 || interval > 3600) throw new Error('刷新间隔须为 1–60 分钟');
  if (!Number.isFinite(divisor) || divisor <= 0) throw new Error('换算除数必须大于 0');
  const text = (value, limit = 160) => typeof value === 'string' && value.length <= limit ? value.trim() : '';
  const unit = text(raw.unit, 12), userId = text(raw.userId);
  if (type !== 'deepseek' && !unit) throw new Error('请填写金额单位');
  if (type === 'newapi' && (!userId || /[\r\n]/.test(userId))) throw new Error('请填写 New API 用户 ID');
  const remainingPath = text(raw.remainingPath), usedPath = text(raw.usedPath);
  const validPath = p => /^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*$/.test(p) && !p.split('.').some(x => ['__proto__', 'prototype', 'constructor'].includes(x));
  if (type === 'custom' && (!validPath(remainingPath) || usedPath && !validPath(usedPath))) throw new Error('金额字段使用点分路径，例如 data.balance；已使用字段可留空');
  return { type, url: url.href, auth: raw.auth, interval, divisor, unit, userId, remainingPath, usedPath, scope: raw.scope === 'key' ? 'key' : 'account' };
}

function atPath(data, path) {
  if (!path) return undefined;
  return path.split('.').reduce((v, key) => v != null && Object.hasOwn(v, key) ? v[key] : undefined, data);
}

export async function queryTarget(settings, credentials, provider, requestedKey) {
  if (typeof provider !== 'string' || !provider || provider.length > 160) throw new Error('供应商不存在');
  const official = provider === 'deepseek-official';
  const section = readProviderSettings(settings, official ? 'llm-deepseek' : 'llm-pi-ai');
  const profile = official ? section : Object.hasOwn(section?.providers ?? {}, provider) ? section.providers[provider] : undefined;
  if (!profile) throw new Error('请先保存供应商');
  const keys = Array.isArray(profile.apiKeys) ? profile.apiKeys : [];
  if (keys.length ? !keys.some(k => k.id === requestedKey) : requestedKey !== 'legacy-default') throw new Error('密钥已变化，请重新打开设置');
  const key = keys.find(k => k.id === requestedKey);
  const ref = key?.credentialRef ?? profile.apiKeyEnv ?? (official ? 'DEEPSEEK_API_KEY' : undefined);
  const apiKey = ref ? (await credentials.resolve(ref))?.value : undefined;
  const baseURL = profile.baseURL ?? (official ? 'https://api.deepseek.com' : undefined);
  const id = 'settings-models-balance/q-' + createHash('sha256').update(JSON.stringify([provider, requestedKey])).digest('hex');
  const binding = createHash('sha256').update(JSON.stringify([apiKey, baseURL])).digest('hex');
  return { id, binding, apiKey, baseURL };
}

export function createQueryEditor({ settings, credentials, readProviders = readCCProviders, fetchImpl = fetch, historyFile = historyFilePath() }) {
  return async (provider, key, action = 'load', body = {}) => {
    const target = await queryTarget(settings, credentials, provider, key);
    const stored = (await credentials.readRecord(target.id))?.payload;
    const current = stored?.binding === target.binding ? stored : undefined;
    const automatic = target.apiKey ? selectRecipe(target.baseURL, target.apiKey, await readProviders()) : null;
    const inherited = automatic ? { ...automatic, auth: automatic.token === target.apiKey ? 'apiKey' : 'custom', divisor: automatic.divisor || 1 } : null;
    const effective = current?.config?.type === 'auto' || !current ? inherited : current.config;
    const revision = stored?.revision || 0;
    if (action === 'load') {
      const config = current?.config || { type: 'auto' };
      const { token, ...safe } = effective || {};
      return { config, suggested: safe, tokenConfigured: !!(current?.token || token), revision, writable: (await credentials.describeRecord(target.id)).writable };
    }
    const config = validateQuery(body.config);
    const tokenDraft = typeof body.token === 'string' ? body.token.trim() : '';
    if (tokenDraft && (!/^[\x21-\x7E]+$/.test(tokenDraft) || tokenDraft.length > 8192)) throw new Error('查询凭证格式不正确');
    const retained = effective?.url === config.url && effective?.auth === 'custom' ? current?.token || inherited?.token : undefined;
    const token = config.auth === 'custom' ? tokenDraft || retained : undefined;
    if (config.auth === 'custom' && !token) throw new Error('请填写查询凭证；更换查询地址后须重新填写');
    if (config.auth === 'apiKey' && !target.apiKey) throw new Error('请先保存此密钥的 API Key');
    if (action === 'test') {
      const recipe = config.type === 'auto' ? automatic : config.type === 'off' ? null : { ...config, token: config.auth === 'apiKey' ? target.apiKey : token };
      if (!recipe) throw new Error('尚未配置可用的查询');
      let result;
      try { result = await queryBalance(recipe, fetchImpl); } catch { return { status: 'error', reason: 'query' }; }
      if (result.status === 'ok' && result.balances) {
        try { result.history = await recordBalanceHistory(provider, key, result.balances, result.updatedAt, historyFile); }
        catch { result.historyError = true; }
      }
      return result;
    }
    if (action !== 'save') throw new Error('未知操作');
    await credentials.modifyRecord(target.id, async previous => {
      if ((previous?.payload?.revision || 0) !== body.revision) throw new Error('查询设置已被修改，请重新打开后再保存');
      return { kind: 'grant', payload: { config, ...(token ? { token } : {}), binding: target.binding, revision: revision + 1 } };
    });
    return { saved: true };
  };
}

// Balance queries run on the authenticated Host. Neither API keys nor the
// CC Switch account access token are returned to the browser. Its DB is read-only.
export async function readCCProviders() {
  let db;
  try {
    const { DatabaseSync } = await import('node:sqlite');
    db = new DatabaseSync(join(homedir(), '.cc-switch', 'cc-switch.db'), { readOnly: true });
    return db.prepare('SELECT settings_config, meta FROM providers WHERE app_type = ?').all('codex').flatMap(row => {
      try {
        const config = JSON.parse(row.settings_config);
        const usage = JSON.parse(row.meta).usage_script;
        const baseURL = typeof config.config === 'string' ? config.config.match(/^\s*base_url\s*=\s*["']([^"']+)["']/m)?.[1] : undefined;
        return [{ apiKey: config.auth?.OPENAI_API_KEY, baseURL, usage }];
      } catch { return []; }
    });
  } catch { return []; }
  finally { db?.close(); }
}

function origin(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.origin : undefined; }
  catch { return undefined; }
}

export function selectRecipe(baseURL, apiKey, providers) {
  const endpoint = origin(baseURL);
  if (!endpoint) return null;
  if (endpoint === 'https://api.deepseek.com') return { url: endpoint + '/user/balance', type: 'deepseek', token: apiKey, interval: 300, scope: 'account' };
  // Gateways often use a different domain for billing. Reuse that explicitly
  // configured CC Switch query only for an exact active-key match; never match
  // accounts by display name or hostname alone. Ambiguous records fail closed.
  const candidates = providers.filter(p => p.apiKey === apiKey && p.usage?.enabled === true);
  const preferred = candidates.filter(p => origin(p.baseURL) === endpoint || origin(p.usage?.baseUrl) === endpoint);
  const matches = preferred.length ? preferred : candidates;
  const identities = new Set(matches.map(p => JSON.stringify([p.usage.templateType, p.usage.baseUrl, p.usage.accessToken, p.usage.userId])));
  const match = identities.size === 1 ? matches[0] : undefined;
  const usage = match?.usage;
  if (!usage) return null;
  const interval = Math.min(3600, Math.max(60, (Number(usage.autoQueryInterval) || 5) * 60));
  if (usage.templateType === 'newapi' && usage.accessToken && usage.userId != null && origin(usage.baseUrl)) {
    // Interpret only the known numeric quota divisor and unit; never execute
    // arbitrary JavaScript from another application's configuration.
    const divisor = Number(usage.code?.match(/remaining\s*:\s*response\.data\.quota\s*\/\s*(\d+(?:\.\d+)?)/)?.[1]);
    const unit = usage.code?.match(/unit\s*:\s*["']([^"']+)["']/)?.[1];
    if (!(divisor > 0) || !['元', 'USD', 'CNY', '$', '¥'].includes(unit)) return null;
    return { url: origin(usage.baseUrl) + '/api/user/self', type: 'newapi', token: usage.accessToken, userId: String(usage.userId), divisor, unit, interval, scope: 'account' };
  }
  if (usage.templateType === 'general' && origin(match.baseURL) === endpoint && usage.code?.includes('{{baseUrl}}/v1/usage')) {
    const unit = usage.code.match(/unit\s*=.*?["'](元|USD|CNY|\$|¥)["']/)?.[1];
    return { url: endpoint + '/v1/usage', type: 'general', token: apiKey, unit, interval, scope: 'key' };
  }
  return null;
}

function amount(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function parseBalance(data, recipe) {
  if (recipe.type === 'custom') {
    const remaining = amount(atPath(data, recipe.remainingPath));
    const used = amount(atPath(data, recipe.usedPath));
    if (remaining === null || recipe.usedPath && used === null) throw new Error('invalid');
    return [{ remaining: remaining / recipe.divisor, used: used === null ? null : used / recipe.divisor, unit: recipe.unit }];
  }
  if (recipe.type === 'deepseek') {
    if (!Array.isArray(data?.balance_infos) || !data.balance_infos.length) throw new Error('invalid');
    return data.balance_infos.map(item => {
      const remaining = amount(item.total_balance);
      if (remaining === null || typeof item.currency !== 'string') throw new Error('invalid');
      return { remaining, used: null, unit: item.currency };
    });
  }
  if (recipe.type === 'newapi') {
    const remaining = amount(data?.data?.quota), used = amount(data?.data?.used_quota);
    if (data?.success !== true || remaining === null || used === null) throw new Error('invalid');
    return [{ remaining: remaining / recipe.divisor, used: used / recipe.divisor, unit: recipe.unit }];
  }
  if (data?.is_active === false || data?.isValid === false || data?.success === false) throw new Error('invalid');
  const remaining = amount(data?.remaining ?? data?.quota?.remaining ?? data?.balance);
  const used = amount(data?.used ?? data?.quota?.used);
  const unit = data?.unit ?? data?.quota?.unit ?? recipe.unit;
  if (remaining === null || typeof unit !== 'string' || unit.length > 12) throw new Error('invalid');
  return [{ remaining, used, unit }];
}

async function queryBalance(recipe, fetchImpl) {
  const headers = { Accept: 'application/json' };
  if (recipe.token) headers.Authorization = `Bearer ${recipe.token}`;
  if (recipe.userId !== undefined) headers['New-Api-User'] = recipe.userId;
  const response = await fetchImpl(recipe.url, { headers, redirect: 'error', signal: AbortSignal.timeout(12000) });
  if (!response.ok) return { status: 'error', reason: response.status === 401 || response.status === 403 ? 'auth' : 'upstream' };
  // Keep malformed endpoints from buffering arbitrarily large responses.
  const reader = response.body.getReader();
  let bytes = 0;
  const chunks = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > 256 * 1024) throw new Error('invalid');
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  const balances = parseBalance(JSON.parse(Buffer.concat(chunks).toString('utf8')), recipe);
  return { status: 'ok', balances, scope: recipe.scope, updatedAt: Date.now(), interval: recipe.interval };
}


export function historyFilePath() {
  return join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'balance-history.json');
}

export function localDay(at = Date.now()) {
  const d = new Date(at);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

export function spendFromReadings(previous, next) {
  if (!next) return 0;
  if (previous?.unit && next.unit && previous.unit !== next.unit) return 0;
  if (typeof next.used === 'number' && typeof previous?.used === 'number' && next.used >= previous.used - 1e-9) {
    return roundMoney(Math.max(0, next.used - previous.used));
  }
  if (typeof next.remaining === 'number' && typeof previous?.remaining === 'number' && next.remaining <= previous.remaining + 1e-9) {
    return roundMoney(Math.max(0, previous.remaining - next.remaining));
  }
  return 0;
}

export function emptyHistoryEntry() {
  return { last: null, days: {} };
}

export function applyBalanceSample(entry, balances, now = Date.now()) {
  const current = entry && typeof entry === 'object' ? entry : emptyHistoryEntry();
  if (current.last?.at >= now) return current;
  const readings = (Array.isArray(balances) ? balances : []).map(item => ({
    used: typeof item?.used === 'number' ? item.used : null,
    remaining: typeof item?.remaining === 'number' ? item.remaining : null,
    unit: typeof item?.unit === 'string' && item.unit ? item.unit : ''
  })).filter(item => item.used != null || item.remaining != null);
  const day = localDay(now);
  const days = { ...(current.days && typeof current.days === 'object' ? current.days : {}) };
  if (!days[day] || typeof days[day] !== 'object') days[day] = {};
  const samples = Array.isArray(current.samples) ? current.samples.filter(item => item && Number.isFinite(item.at)) : [];
  samples.push({ at: now, readings });
  const earliest = now - 36 * 60 * 60 * 1000;
  const recentSamples = samples.filter(item => item.at >= earliest).slice(-400);
  const previousReadings = Array.isArray(current.last?.readings) ? current.last.readings : [];
  for (const reading of readings) {
    const previous = previousReadings.find(item => item.unit === reading.unit);
    const spend = spendFromReadings(previous, reading);
    if (spend > 0) days[day][reading.unit] = roundMoney((Number(days[day][reading.unit]) || 0) + spend);
  }
  return { last: { at: now, readings }, days, samples: recentSamples };
}

export function summarizeHistory(entry, limit = 14) {
  const days = entry?.days && typeof entry.days === 'object' ? entry.days : {};
  const today = localDay();
  const list = Object.keys(days).sort().reverse().slice(0, limit).map(date => ({
    date,
    amounts: Object.entries(days[date] || {}).filter(([, spend]) => Number(spend) > 0).map(([unit, spend]) => ({ unit, spend: roundMoney(spend) }))
  })).filter(row => row.amounts.length > 0);
  const todayAmounts = Object.entries(days[today] || {}).filter(([, spend]) => Number(spend) > 0).map(([unit, spend]) => ({ unit, spend: roundMoney(spend) }));
  return { today: todayAmounts, days: list };
}

function historyKey(provider, key) {
  return `${provider}\t${key}`;
}

let historyLock = Promise.resolve();

export async function recordBalanceHistory(provider, key, balances, now = Date.now(), file = historyFilePath()) {
  const run = historyLock.then(async () => {
    let store = {};
    let previous;
    try {
      previous = await readFile(file, 'utf8');
      store = JSON.parse(previous);
      if (!store || typeof store !== 'object' || Array.isArray(store)) throw new Error('Invalid balance history');
    } catch (error) {
      // An unreadable ledger must never be replaced with an empty ledger.
      if (error?.code !== 'ENOENT') throw error;
    }
    const id = historyKey(provider, key);
    store[id] = applyBalanceSample(store[id], balances, now);
    await mkdir(dirname(file), { recursive: true });
    const temporary = `${file}.${randomUUID()}.tmp`;
    const backupTemporary = `${temporary}.bak`;
    try {
      await writeFile(temporary, JSON.stringify(store), { flag: 'wx' });
      if (previous !== undefined) {
        await writeFile(backupTemporary, previous, { flag: 'wx' });
        await rename(backupTemporary, `${file}.bak`);
      }
      await rename(temporary, file);
    } finally {
      await Promise.all([unlink(temporary).catch(() => {}), unlink(backupTemporary).catch(() => {})]);
    }
    return summarizeHistory(store[id]);
  }, async () => summarizeHistory(emptyHistoryEntry()));
  historyLock = run.then(() => {}, () => {});
  return run;
}

export async function loadBalanceHistory(provider, key, file = historyFilePath()) {
  try {
    const store = JSON.parse(await readFile(file, 'utf8'));
    return summarizeHistory(store?.[historyKey(provider, key)]);
  } catch {
    return summarizeHistory(emptyHistoryEntry());
  }
}

export function createBalanceService({ settings, credentials, readProviders = readCCProviders, fetchImpl = fetch, historyFile, anyNamedKey = false } = {}) {
  const file = historyFile || historyFilePath();
  const cache = new Map();
  const pending = new Map();
  return async function balance(provider, requestedKey, force = false) {
    if (typeof provider !== 'string' || !provider || provider.length > 160) return { status: 'unavailable', reason: 'provider' };
    const official = provider === 'deepseek-official';
    const section = readProviderSettings(settings, official ? 'llm-deepseek' : 'llm-pi-ai');
    const profile = official ? section : Object.hasOwn(section?.providers ?? {}, provider) ? section.providers[provider] : undefined;
    if (!profile) return { status: 'unavailable', reason: 'provider' };
    const keys = Array.isArray(profile.apiKeys) ? profile.apiKeys : [];
    const key = keys.length ? (anyNamedKey ? keys.find(k => k.id === requestedKey) : keys.find(k => k.id === profile.activeApiKey) ?? keys[0]) : null;
    // Reject a stale UI request instead of showing the next key's money under
    // the previous key's name during an asynchronous switch.
    if (requestedKey !== (key?.id ?? 'legacy-default')) return { status: 'unavailable', reason: 'changed' };
    const ref = key?.credentialRef ?? profile.apiKeyEnv ?? (official ? 'DEEPSEEK_API_KEY' : undefined);
    const apiKey = ref ? (await credentials.resolve(ref))?.value : undefined;
    const baseURL = profile.baseURL ?? (official ? 'https://api.deepseek.com' : undefined);
    let recipe;
    if (credentials.readRecord) {
      const target = await queryTarget(settings, credentials, provider, requestedKey);
      const saved = (await credentials.readRecord(target.id))?.payload;
      // The record is already isolated by provider + named key. Keep the saved
      // query visible when an API key rotates; apiKey-auth recipes use the new
      // key automatically, while custom query tokens remain in the record.
      if (saved?.config.type === 'off') return { status: 'unavailable', reason: 'disabled' };
      if (saved && saved.config.type !== 'auto') recipe = { ...validateQuery(saved.config), token: saved.config.auth === 'apiKey' ? apiKey : saved.token };
    }
    if (!recipe && apiKey) recipe = selectRecipe(baseURL, apiKey, await readProviders());
    if (!recipe) return { status: 'unavailable', reason: 'setup' };
    const id = createHash('sha256').update(JSON.stringify([provider, requestedKey, apiKey, recipe])).digest('hex');
    const previous = cache.get(id);
    if (previous && Date.now() - previous.checkedAt < (force ? 10000 : previous.ttl)) {
      if (previous.result?.status === 'ok' && !previous.result.history) {
        previous.result.history = await loadBalanceHistory(provider, requestedKey, file);
      }
      return previous.result;
    }
    if (pending.has(id)) return pending.get(id);
    const task = (async () => {
      let result;
      try { result = await queryBalance(recipe, fetchImpl); }
      catch (error) { result = { status: 'error', reason: error?.name === 'TimeoutError' ? 'timeout' : 'query' }; }
      if (result.status === 'error' && previous?.result.balances) result = { ...previous.result, ...result, stale: true };
      if (result.status === 'ok' && result.balances) {
        try { result.history = await recordBalanceHistory(provider, requestedKey, result.balances, result.updatedAt, file); }
        catch {
          result.historyError = true;
          try { result.history = await loadBalanceHistory(provider, requestedKey, file); }
          catch { result.history = { today: [], days: [] }; }
        }
      }
      cache.set(id, { result, checkedAt: Date.now(), ttl: result.status === 'ok' ? recipe.interval * 1000 : 30000 });
      if (cache.size > 100) cache.delete(cache.keys().next().value);
      return result;
    })();
    pending.set(id, task);
    try { return await task; } finally { pending.delete(id); }
  };
}

// Direct prompt evaluation. Preserve returned content; never execute returned tool calls here.
export function createIntelligenceTestHandler(llm, { timeoutMs = 600000, lifetimeSignal, retryDelaysMs = [2000, 5000, 10000] } = {}) {
  return async request => {
    const json = (body, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
    let input;
    try {
      const body = await request.text();
      if (body.length > 65536) throw new Error();
      input = JSON.parse(body);
      if (!input || !['candy', 'pelican'].includes(input.mode) ||
          !['provider', 'model', 'prompt'].every(key => typeof input[key] === 'string' && input[key].trim()) ||
          input.provider.length > 256 || input.model.length > 512 || input.prompt.length > 32000 ||
          (input.requestId !== undefined && (typeof input.requestId !== 'string' || !/^[A-Za-z0-9._:-]{8,160}$/.test(input.requestId))) ||
          (input.reasoningEffort !== undefined && (typeof input.reasoningEffort !== 'string' || !input.reasoningEffort || input.reasoningEffort.length > 80)) ||
          (input.timeoutMinutes !== undefined && (!Number.isInteger(input.timeoutMinutes) || input.timeoutMinutes < 3 || input.timeoutMinutes > 30))) throw new Error();
    } catch { return json({ error: '检测参数无效，请重新选择模型和题目', code: 'INVALID_INPUT' }, 400); }
    // Legacy clients may omit the ID; still isolate each test and record transport.
    input.requestId ??= randomUUID();
    const budgetMs = input.timeoutMinutes === undefined ? timeoutMs : input.timeoutMinutes * 60000;
    const startedAt = Date.now(), maxRetries = 3;
    let upstreamStartedAt = null, upstreamResponseId = null, attempt = 0, attemptRequestId = input.requestId || null;
    let retrying = false, nextRetryAt = null, retryReason = '', notify = () => {};
    const attemptHistory = [];
    let transport = { observed: false, attempts: 0, responses: 0, failures: 0 };
    const deadline = new AbortController(), consumer = new AbortController();
    const signal = AbortSignal.any([request.signal, deadline.signal, consumer.signal, ...(lifetimeSignal ? [lifetimeSignal] : [])]);
    const blocks = new Map(), reasoning = new Map(), returnedBlocks = new Map();
    const responseContent = () => ({ responseBlocks: [...returnedBlocks.values()], toolCalls: [...returnedBlocks.values()].filter(block => block.type === 'tool-call') });
    let firstChunkMs = null;
    const raw = () => [...blocks.entries()].sort(([a], [b]) => a - b).map(([, text]) => text).join('');
    const chars = values => [...values.values()].reduce((n, text) => n + text.length, 0);
    const retryState = () => ({ attempt, attemptRequestId, maxRetries, retryCount: Math.max(0, attempt - 1), retrying, nextRetryAt, retryReason, attemptHistory: [...attemptHistory] });
    const trace = () => ({ requestId: input.requestId || null, provider: input.provider, model: input.model, serverStartedAt: startedAt, upstreamStartedAt, upstreamResponseId, transport: { ...transport }, serverElapsedMs: Date.now() - startedAt, ...retryState() });
    const progress = () => ({ transport: { ...transport }, elapsedMs: Date.now() - startedAt, firstChunkMs, textChars: chars(blocks), reasoningChars: [...reasoning.values()].reduce((a, b) => a + b, 0), timeoutMs: budgetMs, reasoningEffort: input.reasoningEffort ?? 'default', ...retryState() });
    // Checkpoints preserve received text/reasoning if the browser connection drops before the final event.
    const checkpoint = () => ({ ...progress(), partialRaw: raw(), ...responseContent() });
    const failure = (code, status, message) => ({ status, body: { error: message, code, partialRaw: raw(), ...responseContent(), ...progress(), ...trace() } });
    const providerFailure = error => {
      const code = typeof error?.code === 'string' && /^[A-Z_]{1,64}$/.test(error.code) ? error.code : 'PROVIDER_ERROR';
      if (code === 'PROVIDER_DISABLED') return failure(code, 409, '供应商已停用，请在模型设置中启用并保存后重试。');
      const status = Number.isInteger(error?.status) && error.status >= 400 && error.status <= 599 ? error.status : undefined;
      const messages = { TIMEOUT: '供应商连接或流空闲超时', LLM_STREAM_IDLE_TIMEOUT: '供应商输出中断或长时间无响应', AUTH: '供应商鉴权失败，请检查此模型绑定的密钥', RATE_LIMIT: '供应商限流，请稍后重试', SERVER: '供应商服务异常', TRANSPORT: '供应商网络连接失败', STREAM_CLOSED: '供应商连接提前结束', UNSUPPORTED_REASONING_EFFORT: '此模型不支持所选思考档位，请刷新模型目录并重新选择', UNKNOWN_MODEL: '模型已不存在，请重新选择', INVALID_CONFIG: '模型配置无效，请检查供应商设置' };
      return { ...failure(code, 502, `${messages[code] || '模型请求失败，请检查供应商连接和模型配置'}${status ? `（HTTP ${status}）` : ''} · 已等待 ${Math.round((Date.now() - startedAt) / 1000)} 秒`), providerStatus: status };
    };
    const canRetry = result => {
      if (signal.aborted || attempt > maxRetries) return false;
      const code = result.body.code;
      if (['AUTH', 'INVALID_CREDENTIAL', 'QUOTA', 'QUOTA_EXCEEDED', 'INVALID_REQUEST', 'INVALID_CONFIG', 'INVALID_INPUT', 'UNKNOWN_MODEL', 'UNKNOWN_PROVIDER', 'PROVIDER_DISABLED', 'UNSUPPORTED_REASONING_EFFORT', 'UNSUPPORTED_CONTENT', 'CONTEXT_WINDOW_EXCEEDED', 'MAX_TOKENS', 'CANCELLED', 'ABORTED', 'SERVICE_STOPPED', 'TEST_TIMEOUT'].includes(code)) return false;
      if (result.providerStatus >= 400 && result.providerStatus < 500 && ![408, 429].includes(result.providerStatus)) return false;
      return ['TIMEOUT', 'LLM_STREAM_IDLE_TIMEOUT', 'RATE_LIMIT', 'SERVER', 'TRANSPORT', 'STREAM_CLOSED', 'INCOMPLETE', 'EMPTY_RESPONSE'].includes(code) || [408, 429].includes(result.providerStatus) || result.providerStatus >= 500;
    };
    const interrupted = () => {
      retrying = false; nextRetryAt = null;
      if (deadline.signal.aborted) {
        const saved = chars(blocks) || attemptHistory.reduce((sum, item) => sum + (item.textChars || 0), 0);
        return failure('TEST_TIMEOUT', 504, `检测达到 ${Math.round(budgetMs / 60000)} 分钟总时限；${saved ? '已保留收到的未完成内容' : '尚未收到正文'}。总时限已用完，不再自动重试。`);
      }
      return failure(lifetimeSignal?.aborted ? 'SERVICE_STOPPED' : 'CANCELLED', 499, lifetimeSignal?.aborted ? '后台服务重启，检测已中断' : '测试已取消');
    };
    const waitForRetry = ms => new Promise((resolve, reject) => {
      let timer;
      const abort = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); reject(new Error('aborted')); };
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) { abort(); return; }
      timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, ms);
    });
    const executeAttempt = async () => {
      let onAbort;
      const transportForAttempt = transport, generation = attempt;
      try {
        signal.throwIfAborted();
        const aborted = new Promise((_, reject) => {
          onAbort = () => reject(new Error('aborted'));
          signal.addEventListener('abort', onAbort, { once: true });
        });
        const task = (async () => {
          let finish;
          const onIntelligenceTransport = event => {
            if (generation !== attempt || signal.aborted) return;
            if (event.type === 'http-start') { transportForAttempt.observed = true; transportForAttempt.attempts++; transportForAttempt.lastStartedAt = event.startedAt; transportForAttempt.firstStartedAt ??= event.startedAt; if (event.cacheIsolation === 'per-attempt-query') transportForAttempt.cacheIsolation = event.cacheIsolation; }
            if (event.type === 'http-response') { transportForAttempt.responses++; transportForAttempt.status = event.status; transportForAttempt.headersMs = event.headersMs; transportForAttempt.receivedAt = event.receivedAt; transportForAttempt.headers = event.headers; }
            if (event.type === 'http-error') transportForAttempt.failures++;
          };
          for await (const chunk of llm.stream({
            provider: input.provider, model: input.model, signal,
            ...(attemptRequestId ? { intelligenceRequestId: attemptRequestId, onIntelligenceTransport } : {}),
            ...(input.reasoningEffort === undefined ? {} : { reasoningEffort: input.reasoningEffort }),
            messages: [createUserMessage({ content: [{ type: 'text', text: input.prompt }], source: { kind: 'user' } })]
          })) {
            signal.throwIfAborted();
            if (chunk.type === 'block-end') returnedBlocks.set(chunk.index, chunk.block);
            if (chunk.type === 'text-delta' || chunk.type === 'reasoning-delta') {
              const previous = returnedBlocks.get(chunk.index);
              returnedBlocks.set(chunk.index, { type: chunk.type === 'text-delta' ? 'text' : 'reasoning', text: (previous?.text || '') + chunk.text });
            }
            if (chunk.type === 'tool-call-delta') {
              const previous = returnedBlocks.get(chunk.index);
              returnedBlocks.set(chunk.index, { type: 'tool-call', id: chunk.id ?? previous?.id, name: chunk.name || previous?.name || '', arguments: (previous?.arguments || '') + (chunk.argumentsDelta || '') });
            }
            if (chunk.type === 'text-delta') blocks.set(chunk.index, (blocks.get(chunk.index) || '') + chunk.text);
            if (chunk.type === 'reasoning-delta') reasoning.set(chunk.index, (reasoning.get(chunk.index) || 0) + chunk.text.length);
            if (chunk.type === 'block-end' && chunk.block.type === 'text') blocks.set(chunk.index, chunk.block.text);
            if (chunk.type === 'block-end' && chunk.block.type === 'reasoning') reasoning.set(chunk.index, chunk.block.text?.length || 0);
            if (firstChunkMs === null && (chars(blocks) || [...reasoning.values()].some(Boolean))) firstChunkMs = Date.now() - upstreamStartedAt;
            if (chunk.type === 'finish') {
              finish = chunk.reason;
              const id = chunk.replayState?.response?.responseId;
              if (typeof id === 'string' && id.length <= 512) upstreamResponseId = id;
              break;
            }
          }
          signal.throwIfAborted();
          if (finish?.failure) return providerFailure(finish.failure);
          if (finish?.kind === 'max-tokens') return failure('MAX_TOKENS', 502, '模型输出达到长度上限，已保留内容；重复同一请求不会提高长度上限，不自动重试');
          if (!finish) return failure('INCOMPLETE', 502, '模型未正常结束答复，测试未完成');
          if (!raw().trim() && !responseContent().toolCalls.length) return failure('EMPTY_RESPONSE', 502, '模型没有返回正文，已保留收到的思考内容');
          return { status: 200, body: { raw: raw(), rawSha256: createHash('sha256').update(raw()).digest('hex'), ...responseContent(), finishReason: finish, ...progress(), ...trace() } };
        })();
        return await Promise.race([task, aborted]);
      } catch (error) {
        return signal.aborted ? interrupted() : providerFailure(error);
      } finally {
        if (onAbort) signal.removeEventListener('abort', onAbort);
      }
    };
    const execute = async () => {
      const timer = setTimeout(() => deadline.abort(), budgetMs);
      try {
        for (attempt = 1; attempt <= maxRetries + 1; attempt++) {
          signal.throwIfAborted();
          if (Date.now() - startedAt >= budgetMs) { deadline.abort(); return interrupted(); }
          retrying = false; nextRetryAt = null;
          attemptRequestId = !input.requestId ? null : attempt === 1 ? input.requestId : `${input.requestId.slice(0, 100)}:${createHash('sha256').update(input.requestId).digest('hex').slice(0, 20)}:retry-${attempt - 1}`;
          blocks.clear(); reasoning.clear(); returnedBlocks.clear();
          transport = { observed: false, attempts: 0, responses: 0, failures: 0 };
          upstreamResponseId = null; firstChunkMs = null; upstreamStartedAt = Date.now();
          notify();
          const result = await executeAttempt();
          if (!result.body.error || !canRetry(result)) {
            if (result.body.error && attempt === maxRetries + 1) result.body.retryStopReason = '已自动重试 3 次，仍未完成';
            return result;
          }
          const delay = Math.max(0, Number(retryDelaysMs[attempt - 1]) || 0);
          if (Date.now() + delay >= startedAt + budgetMs) {
            result.body.retryStopReason = '剩余总时限不足，未继续重试';
            return result;
          }
          // Store immutable per-attempt content before resetting buffers; never mix answers across attempts.
          const { attemptHistory: _history, ...saved } = result.body;
          attemptHistory.push({ ...saved, requestId: attemptRequestId, attempt, completedAt: Date.now(), attemptElapsedMs: Date.now() - upstreamStartedAt });
          retrying = true; nextRetryAt = Date.now() + delay; retryReason = result.body.error;
          notify();
          await waitForRetry(delay);
        }
      } catch (error) {
        return signal.aborted ? interrupted() : providerFailure(error);
      } finally {
        clearTimeout(timer); consumer.abort();
      }
    };
    if (!request.headers.get('accept')?.includes('application/x-ndjson')) {
      const result = await execute();
      return json(result.body, result.status);
    }
    const encoder = new TextEncoder();
    let closed = false;
    return new Response(new ReadableStream({
      start(controller) {
        const send = item => { if (!closed) controller.enqueue(encoder.encode(JSON.stringify(item) + '\n')); };
        notify = () => send({ type: 'progress', ...checkpoint() });
        notify();
        const heartbeat = setInterval(notify, 1000);
        void execute().then(result => send({ type: 'result', ...result.body })).catch(() => send({ type: 'result', ...failure('INTERNAL', 500, '检测服务异常').body })).finally(() => {
          clearInterval(heartbeat);
          if (!closed) { closed = true; controller.close(); }
        });
      },
      cancel() { closed = true; consumer.abort(); }
    }), { headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' } });
  };
}

// Save the returned document without rewriting its content; retain the legacy SVG export path.
export function revealIntelligenceArtifact(filePath, spawnProcess = spawn, selectFile = true) {
  if (process.platform !== 'win32') throw new Error('Windows Explorer is unavailable');
  return new Promise((resolveOpened, reject) => {
    // Explorer is the user-requested UI, not a background helper. Hiding it creates
    // invisible folder windows even though the process and HTTP request succeed.
    const child = spawnProcess(join(process.env.SystemRoot || 'C:\\Windows', 'explorer.exe'), selectFile ? ['/select,', filePath] : [filePath], { shell: false, windowsHide: false, detached: true, stdio: 'ignore' });
    child.once('error', reject);
    child.once('spawn', () => { child.unref(); resolveOpened(); });
  });
}

export function createIntelligenceArtifactHandler({ directory = resolve('output', 'intelligence-tests'), reveal = revealIntelligenceArtifact, openDirectory = path => revealIntelligenceArtifact(path, spawn, false) } = {}) {
  const headers = { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };
  const csp = "sandbox allow-scripts; frame-ancestors 'none'";
  return async request => {
    try {
      if (request.method === 'GET') {
        const id = new URL(request.url).searchParams.get('id');
        if (!/^[a-f0-9]{64}$/.test(id || '')) return Response.json({ error: '文件地址无效' }, { status: 400, headers });
        const html = await readFile(join(directory, `pelican-${id}.html`), 'utf8');
        return new Response(html, { headers: { ...headers, 'content-type': 'text/html; charset=utf-8', 'content-security-policy': csp } });
      }
      if (request.method !== 'POST') return new Response(null, { status: 405, headers });
      const body = await request.text();
      if (Buffer.byteLength(body) > 4 * 1024 * 1024) return Response.json({ error: '动画内容过大，无法保存' }, { status: 413, headers });
      let input;
      try { input = JSON.parse(body); } catch { return Response.json({ error: '文件内容无效' }, { status: 400, headers }); }
      if (input?.action === 'open-plugin-folder') return createPersonalPluginFolderHandler()(request);
      if (input?.action === 'open-folder') {
        // Opening is independent of browser history and never recreates deleted artifacts.
        await mkdir(directory, { recursive: true });
        try { await openDirectory(resolve(directory)); }
        catch { return Response.json({ error: '无法打开资源管理器，请手动打开 output/intelligence-tests 文件夹' }, { status: 500, headers }); }
        return Response.json({ ok: true }, { headers });
      }
      if (input?.action === 'reveal') {
        if (!/^[a-f0-9]{64}$/.test(input.id || '')) return Response.json({ error: '文件地址无效' }, { status: 400, headers });
        const filePath = resolve(directory, `pelican-${input.id}.html`);
        if (!(await lstat(filePath)).isFile()) return Response.json({ error: '文件地址无效' }, { status: 400, headers });
        try { await reveal(filePath); }
        catch { return Response.json({ error: '无法打开资源管理器，请复制地址手动打开所在文件夹' }, { status: 500, headers }); }
        return Response.json({ ok: true }, { headers });
      }
      const svg = input?.svg;
      if (typeof input?.html !== 'string' && (typeof svg !== 'string' || !/^\s*<svg\b/i.test(svg) || !/<\/svg>\s*$/i.test(svg))) return Response.json({ error: '没有可保存的 SVG 动画' }, { status: 400, headers });
      if (typeof input.html === 'string' && !/<(?:html|svg|!doctype)\b/i.test(input.html)) return Response.json({ error: '没有可保存的 HTML / SVG' }, { status: 400, headers });
      const title = String(input.title || '鹈鹕骑自行车').slice(0, 200).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
      const html = typeof input.html === 'string' ? input.html : `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${title}</title><style>html,body{margin:0;min-height:100%;background:#151619;color:#eee;font:14px system-ui}main{min-height:100vh;display:grid;place-items:center}img{display:block;max-width:100%;max-height:100vh;width:auto;height:auto}</style></head><body><main><img alt="${title}" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></main></body></html>\n`;
      if (input.runId !== undefined && (typeof input.runId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(input.runId))) return Response.json({ error: '检测轮次无效' }, { status: 400, headers });
      // Each run owns an artifact even when the upstream returns identical HTML.
      // Re-saving the same run remains idempotent; legacy exports keep their IDs.
      const id = createHash('sha256').update(input.runId ? `${input.runId}\0${html}` : html).digest('hex');
      const name = `pelican-${id}.html`;
      await mkdir(directory, { recursive: true });
      try { await writeFile(join(directory, name), html, { encoding: 'utf8', flag: 'wx' }); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
      return Response.json({ id, name, path: resolve(directory, name), url: `/api/intelligence-artifact?id=${id}` }, { headers });
    } catch (error) {
      return Response.json({ error: error.code === 'ENOENT' ? '文件不存在，可能已被删除' : '文件保存或读取失败，请检查输出目录权限' }, { status: error.code === 'ENOENT' ? 404 : 500, headers });
    }
  };
}

export function apply(ctx, config = Config({})) {
  applyIntelligence(ctx, config);
  applyBalance(ctx, config);
}

// services.js is built under packages/dsh-personal-customizations/lib. Open the
// complete durable source tree, not just the bundle metadata or generated files.
export function personalSourceDirectory() {
  const here = dirname(fileURLToPath(import.meta.url));
  // Runtime: packages/<bundle>/lib; source: plugins/personal-toolbox/src/shared.
  const source = here.endsWith(join('src', 'shared'));
  const base = source ? resolve(here, '..', '..') : resolve(here, '..', '..', '..');
  return source ? base : join(base, 'plugins', 'personal-toolbox');
}
export function openPersonalSourceDirectory(directory, spawnProcess = spawn) {
  if (process.platform !== 'win32') return Promise.reject(new Error('Windows Explorer is unavailable'));
  // Start Explorer through the desktop shell and await the opener's result rather
  // than declaring success as soon as an explorer.exe child is spawned. Encode a
  // fixed, server-owned path; no client input is interpolated into a command.
  const literal = directory.replace(/'/g, "''");
  const script = `$ErrorActionPreference = 'Stop'; try { Start-Process -FilePath (Join-Path $env:SystemRoot 'explorer.exe') -ArgumentList ('\"' + '${literal}' + '\"'); exit 0 } catch { exit 1 }`;
  const encoded = Buffer.from(script, 'utf16le').toString('base64');
  return new Promise((resolveOpened, reject) => {
    const child = spawnProcess(join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'), ['-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', encoded], { shell: false, windowsHide: true, stdio: 'ignore' });
    const timeout = setTimeout(() => { child.kill(); reject(new Error('OPENER_TIMEOUT')); }, 10000);
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.once('exit', code => { clearTimeout(timeout); code === 0 ? resolveOpened() : reject(new Error('OPENER_FAILED')); });
  });
}
export function createPersonalPluginFolderHandler({ directory = personalSourceDirectory(), openDirectory = openPersonalSourceDirectory } = {}) {
  const headers = { 'cache-control': 'no-store' };
  return async request => {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers });
    try {
      if (!(await lstat(directory)).isDirectory()) throw Object.assign(new Error('not a directory'), { code: 'ENOENT' });
      await openDirectory(directory);
      return Response.json({ ok: true, path: directory }, { headers });
    } catch (error) {
      const missing = error.code === 'ENOENT';
      return Response.json({ error: missing ? '定制源码目录不存在' : '资源管理器未能打开，请复制下方路径手动打开', path: directory }, { status: missing ? 404 : 500, headers });
    }
  };
}
export function applyIntelligence(ctx) {
  ctx.inject(['connection'], scoped => {
    scoped.connection.fetch.register({
      path: '/api/personal-plugin-folder', methods: ['POST'], requestBody: 'buffered',
      fetch: createPersonalPluginFolderHandler()
    });
    scoped.connection.fetch.register({
      path: '/api/intelligence-artifact', methods: ['GET', 'POST'], requestBody: 'buffered',
      fetch: createIntelligenceArtifactHandler()
    });
  });
  ctx.inject(['connection', 'llm'], scoped => {
    const lifetime = new AbortController();
    scoped.effect(() => () => lifetime.abort(), 'personal-customizations: intelligence requests');
    scoped.connection.fetch.register({
      path: '/api/intelligence-test', methods: ['POST'], requestBody: 'buffered',
      fetch: createIntelligenceTestHandler(scoped.llm, { lifetimeSignal: lifetime.signal })
    });
  });
}

export function applyBalance(ctx) {
  ctx.inject(['connection', 'settings', 'credentials'], scoped => {
    const lifetime = new AbortController();
    scoped.effect(() => () => lifetime.abort(), 'personal-customizations: balance requests');
    const fetchImpl = (input, options = {}) => fetch(input, { ...options, signal: AbortSignal.any([lifetime.signal, ...(options.signal ? [options.signal] : [])]) });
    const balance = createBalanceService({ settings: scoped.settings, credentials: scoped.credentials, fetchImpl });
    const editor = createQueryEditor({ settings: scoped.settings, credentials: scoped.credentials, fetchImpl });
    scoped.connection.fetch.register({
      path: '/api/provider-balance-settings', methods: ['GET', 'POST'], requestBody: 'buffered',
      fetch: async request => {
        try {
          const url = new URL(request.url);
          let body = {};
          if (request.method === 'POST') {
            const text = await request.text();
            if (text.length > 16384) throw new Error('查询配置过大');
            body = JSON.parse(text);
          }
          const result = await editor(url.searchParams.get('provider'), url.searchParams.get('key'), request.method === 'GET' ? 'load' : body.action, body);
          return Response.json(result, { headers: { 'cache-control': 'no-store' } });
        } catch (error) {
          const message = /[\u4e00-\u9fff]/.test(error.message) ? error.message : '查询设置操作失败，请检查输入后重试';
          return Response.json({ error: message }, { status: 400, headers: { 'cache-control': 'no-store' } });
        }
      }
    });
    // Connection applies the same Host/Origin and signed-session guards as its
    // other /api routes before dispatching this handler.
    scoped.connection.fetch.register({
      path: '/api/provider-balance', methods: ['GET'], requestBody: 'buffered',
      fetch: async request => {
        const url = new URL(request.url);
        let result;
        try { result = await balance(url.searchParams.get('provider'), url.searchParams.get('key'), url.searchParams.get('refresh') === '1'); }
        catch { result = { status: 'error', reason: 'query' }; }
        return Response.json(result, { headers: { 'cache-control': 'no-store' } });
      }
    });
    scoped.connection.fetch.register({
      path: '/api/provider-balance-history', methods: ['GET'], requestBody: 'buffered',
      fetch: async request => {
        const url = new URL(request.url);
        try {
          const history = await loadBalanceHistory(url.searchParams.get('provider'), url.searchParams.get('key'));
          return Response.json(history, { headers: { 'cache-control': 'no-store' } });
        } catch {
          return Response.json({ today: [], days: [] }, { headers: { 'cache-control': 'no-store' } });
        }
      }
    });
  });
}

export function applySpendingHost(ctx) {
  ctx.inject(['connection', 'settings', 'credentials', 'llm'], scoped => {
    const lifetime = new AbortController();
    scoped.effect(() => () => lifetime.abort(), 'personal-customizations: spending requests');
    const fetchImpl = (input, options = {}) => fetch(input, {
      ...options,
      signal: AbortSignal.any([lifetime.signal, ...(options.signal ? [options.signal] : [])])
    });
    applySpending(scoped, {
      balance: createBalanceService({ settings: scoped.settings, credentials: scoped.credentials, fetchImpl, anyNamedKey: true }),
      historyFile: historyFilePath()
    });
  });
}

export { name, inject };
