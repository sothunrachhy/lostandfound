/**
 * Auth token storage + a fetch wrapper that attaches it to API requests.
 *
 * Wrapping fetch once, here, means every existing call site keeps working
 * unchanged and no future one can forget the Authorization header.
 */
const TOKEN_KEY = 'lf_token';
const API_BASE  = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch (_e) { return null; }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_e) { /* private mode / storage disabled */ }
};

export const clearToken = () => setToken(null);

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export function installAuthFetch() {
  if (window.__lfAuthFetchInstalled) return;
  window.__lfAuthFetchInstalled = true;

  const nativeFetch = window.fetch.bind(window);

  // Only our own API gets the token — never a third-party host.
  const isOurApi = (url) =>
    !!url && ((API_BASE && url.startsWith(API_BASE)) || url.startsWith('/api/') || url.startsWith('/auth/'));

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    if (!isOurApi(url)) return nativeFetch(input, init);

    const token   = getToken();
    const headers = new Headers(init.headers || {});
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);

    const res = await nativeFetch(input, { ...init, headers });

    // Expired or rejected token: drop the stale session so the UI returns to sign-in.
    // Fires even when no token was sent, so sessions saved before tokens
    // existed are cleared instead of retrying forever.
    if (res.status === 401) { clearToken(); onUnauthorized(); }
    return res;
  };
}
