/**
 * Thin wrapper over the Telegram Mini App SDK.
 *
 * Everything here degrades gracefully when `window.Telegram` is absent, so
 * the app can be opened in a normal browser during development — it just
 * cannot sign in, because there is no signed initData to verify.
 */
const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

export const isTelegram = Boolean(tg?.initData);

/** Raw signed blob. The server verifies this; never trust it client-side. */
export const initData = tg?.initData || '';

/** Unverified, for display only — the server decides who you really are. */
export const telegramUser = tg?.initDataUnsafe?.user || null;

export function ready() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  // Stops a downward swipe from dismissing the app mid-scroll.
  tg.disableVerticalSwipes?.();
}

export function bindBackButton(onClick) {
  if (!tg?.BackButton) return () => {};
  if (!onClick) {
    tg.BackButton.hide();
    return () => {};
  }
  tg.BackButton.show();
  tg.BackButton.onClick(onClick);
  return () => {
    tg.BackButton.offClick(onClick);
    tg.BackButton.hide();
  };
}

export function haptic(style = 'light') {
  try {
    tg?.HapticFeedback?.impactOccurred(style);
  } catch { /* older clients */ }
}

export function notifyHaptic(type = 'success') {
  try {
    tg?.HapticFeedback?.notificationOccurred(type);
  } catch { /* older clients */ }
}

/**
 * Telegram exposes the user's theme as CSS custom properties on <html>, but
 * only some clients set them all. Fill in the gaps so the UI is never
 * unreadable on a client that omits one.
 */
export function applyTheme() {
  const root = document.documentElement;
  const dark = tg?.colorScheme === 'dark';

  const fallbacks = {
    '--tg-theme-bg-color': dark ? '#17212b' : '#ffffff',
    '--tg-theme-secondary-bg-color': dark ? '#232e3c' : '#f1f5f9',
    '--tg-theme-text-color': dark ? '#f5f5f5' : '#0f172a',
    '--tg-theme-hint-color': dark ? '#7d8b99' : '#64748b',
    '--tg-theme-link-color': dark ? '#6ab3f3' : '#0f766e',
    '--tg-theme-button-color': dark ? '#0f766e' : '#0f766e',
    '--tg-theme-button-text-color': '#ffffff',
    '--tg-theme-destructive-text-color': dark ? '#ec3942' : '#be123c',
  };

  for (const [name, value] of Object.entries(fallbacks)) {
    if (!getComputedStyle(root).getPropertyValue(name).trim()) {
      root.style.setProperty(name, value);
    }
  }

  root.dataset.theme = dark ? 'dark' : 'light';
}

export function onThemeChange(handler) {
  if (!tg) return () => {};
  tg.onEvent('themeChanged', handler);
  return () => tg.offEvent('themeChanged', handler);
}

export default tg;
