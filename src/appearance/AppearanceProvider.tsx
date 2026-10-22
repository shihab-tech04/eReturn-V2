import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { THEMES, THEME_ORDER, type ThemeId } from './themes';

/** Mirror Sobaike Janao Public's Noto Sans / Noto Sans Bengali typography. */
export type FontId = 'noto-sans';
export type FontSizeId = 'standard' | 'large';
export const FONT_OPTIONS: { id: FontId; name: string; family: string }[] = [
  { id: 'noto-sans', name: 'Noto Sans', family: "'Noto Sans', 'Noto Sans Bengali', sans-serif" },
];
const STORAGE_KEY = 'ereturn-v2-appearance-only';

interface AppearanceValue {
  themeId: ThemeId;
  setThemeId: (next: ThemeId) => void;
  fontId: FontId;
  setFontId: (next: FontId) => void;
  fontSizeId: FontSizeId;
  setFontSizeId: (next: FontSizeId) => void;
}
const AppearanceContext = createContext<AppearanceValue | null>(null);

function readPreferences(): { themeId: ThemeId; fontId: FontId; fontSizeId: FontSizeId } {
  const defaults = { themeId: 'light' as ThemeId, fontId: 'noto-sans' as FontId, fontSizeId: 'standard' as FontSizeId };
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    const rawTheme = saved.themeId === 'indigo-blue' ? 'light' : saved.themeId === 'dark-mode' ? 'dark' : saved.themeId;
    return {
      themeId: THEME_ORDER.includes(rawTheme) ? rawTheme : defaults.themeId,
      fontId: defaults.fontId,
      fontSizeId: saved.fontSizeId === 'large' ? 'large' : defaults.fontSizeId,
    };
  } catch { return defaults; }
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { language } = useApp();
  const [prefs, setPrefs] = useState(readPreferences);
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true);
  const value = useMemo<AppearanceValue>(() => ({
    ...prefs,
    setThemeId: themeId => setPrefs(old => ({ ...old, themeId })),
    setFontId: fontId => setPrefs(old => ({ ...old, fontId })),
    setFontSizeId: fontSizeId => setPrefs(old => ({ ...old, fontSizeId })),
  }), [prefs]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const update = (ev: MediaQueryListEvent) => setSystemDark(ev.matches);
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const resolved = prefs.themeId === 'system' ? (systemDark ? 'dark' : 'light') : prefs.themeId;
    const theme = THEMES[resolved];
    root.dataset.theme = resolved;
    root.dataset.erTheme = resolved;
    root.dataset.erFontSize = prefs.fontSizeId;
    root.dataset.textSize = prefs.fontSizeId;
    root.lang = language;
    root.style.colorScheme = resolved;
    root.classList.toggle('dark', resolved === 'dark');
    for (const [key, cssValue] of Object.entries(theme)) {
      if (key !== 'id' && key !== 'name') {
        root.style.setProperty('--er-' + key.replace(/[A-Z]/g, m => '-' + m.toLowerCase()), String(cssValue));
      }
    }
    root.style.setProperty('--er-on-primary', '#FFFFFF');
    root.style.setProperty('--er-font-size', '16px');
    root.style.setProperty('--er-font-family',
      language === 'bn'
        ? "'Noto Sans Bengali', 'Noto Sans', sans-serif"
        : "'Noto Sans', 'Noto Sans Bengali', sans-serif");
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); }
    catch { /* Appearance preference storage is optional; never save tax data here. */ }
  }, [prefs, language, systemDark]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}
export function useAppearance(): AppearanceValue {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('AppearanceProvider is required');
  return value;
}
