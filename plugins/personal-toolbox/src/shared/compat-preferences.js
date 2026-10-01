// Synchronous preference store for client startup. Build embeds this into each
// consumer factory: no asynchronous race, dependency or extra network request.
// Cookie is a five-bit fallback, not a store for history, credentials or replies.
const COMPAT_PREF_IDS = ['modelMenu', 'models', 'effort', 'sessions', 'skills'];
const COMPAT_PREF_KEY = 'dsh.local.compat.v1';
const COMPAT_PREF_COOKIE = 'dsh_compat_v1';
function readCompatCookie() {
  try {
    const part = globalThis.document?.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(COMPAT_PREF_COOKIE + '='));
    const bits = part?.slice(COMPAT_PREF_COOKIE.length + 1);
    return /^[01]{5}$/.test(bits || '') ? Object.fromEntries(COMPAT_PREF_IDS.map((id, index) => [id, bits[index] === '1'])) : null;
  } catch { return null; }
}
function readCompatPreferences() {
  const fallback = readCompatCookie();
  if (fallback) return fallback;
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(COMPAT_PREF_KEY) || '{}');
    return Object.fromEntries(COMPAT_PREF_IDS.map(id => [id, value?.[id] !== false]));
  } catch { return Object.fromEntries(COMPAT_PREF_IDS.map(id => [id, true])); }
}
function compatLayerOff(id) { return readCompatPreferences()[id] === false; }
function writeCompatPreferences(value) {
  const next = Object.fromEntries(COMPAT_PREF_IDS.map(id => [id, value[id] !== false]));
  const encoded = JSON.stringify(next);
  const writeLocal = () => {
    const storage = globalThis.localStorage;
    if (!storage) throw new Error('Browser localStorage unavailable');
    storage.setItem(COMPAT_PREF_KEY, encoded);
    if (storage.getItem(COMPAT_PREF_KEY) !== encoded) throw new Error('Browser localStorage did not retain preferences');
  };
  // A valid fallback has priority over localStorage. Keep it authoritative even
  // when localStorage later becomes writable; never resurrect stale settings.
  const hadCookie = readCompatCookie() !== null;
  if (!hadCookie) {
    try { writeLocal(); return { layers: next, storage: 'localStorage' }; } catch {}
  }
  const bits = COMPAT_PREF_IDS.map(id => next[id] ? '1' : '0').join('');
  const doc = globalThis.document;
  if (!doc) throw new Error('Browser preference storage unavailable');
  doc.cookie = COMPAT_PREF_COOKIE + '=' + bits + '; Path=/; Max-Age=31536000; SameSite=Strict' + (globalThis.location?.protocol === 'https:' ? '; Secure' : '');
  const saved = readCompatCookie();
  if (!saved || COMPAT_PREF_IDS.some(id => saved[id] !== next[id])) throw new Error('Browser rejected preference cookie');
  // Mirror when possible, without deleting or trimming any other stored data.
  try { writeLocal(); } catch {}
  return { layers: next, storage: 'cookie' };
}
