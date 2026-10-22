import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { THEMES, THEME_ORDER, type ThemeId } from './themes';

export type FontId = 'inter' | 'poppins' | 'noto-sans' | 'google-sans';
export type FontSizeId = 'compact' | 'standard' | 'large';

export const FONT_OPTIONS: { id: FontId; name: string; family: string }[] = [
  { id: 'inter', name: 'Inter', family: "Inter, 'Noto Sans Bengali', sans-serif" },
  { id: 'poppins', name: 'Poppins', family: "Poppins, 'Noto Sans Bengali', sans-serif" },
  { id: 'noto-sans', name: 'Noto Sans', family: "'Noto Sans', 'Noto Sans Bengali', sans-serif" },
  { id: 'google-sans', name: 'Google Sans', family: "'DM Sans', 'Google Sans', 'Noto Sans Bengali', sans-serif" },
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
  const defaults = { themeId: 'indigo-blue' as ThemeId, fontId: 'inter' as FontId, fontSizeId: 'standard' as FontSizeId };
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      themeId: THEME_ORDER.includes(saved.themeId) ? saved.themeId : defaults.themeId,
      fontId: FONT_OPTIONS.some((f) => f.id === saved.fontId) ? saved.fontId : defaults.fontId,
      fontSizeId: (['compact', 'standard', 'large'] as string[]).includes(saved.fontSizeId) ? saved.fontSizeId : defaults.fontSizeId,
    };
  } catch {
    return defaults;
  }
}

/** Only non-sensitive appearance preferences are persisted. Return data stays in memory unless explicitly exported. */
export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { language } = useApp();
  const [prefs, setPrefs] = useState(readPreferences);
  const value = useMemo<AppearanceValue>(() => ({
    ...prefs,
    setThemeId: (themeId) => setPrefs((old) => ({ ...old, themeId })),
    setFontId: (fontId) => setPrefs((old) => ({ ...old, fontId })),
    setFontSizeId: (fontSizeId) => setPrefs((old) => ({ ...old, fontSizeId })),
  }), [prefs]);

  useEffect(() => {
    const root = document.documentElement;
    const theme = THEMES[prefs.themeId];
    root.dataset.erTheme = theme.id;
    for (const [key, cssValue] of Object.entries(theme)) {
      if (key !== 'id' && key !== 'name') {
        root.style.setProperty('--er-' + key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()), String(cssValue));
      }
    }
    root.style.setProperty('--er-on-primary', theme.id === 'dark-mode' ? '#202124' : '#FFFFFF');
    root.style.setProperty('--er-font-size', prefs.fontSizeId === 'compact' ? '14.4px' : prefs.fontSizeId === 'large' ? '17.6px' : '16px');
    const face = FONT_OPTIONS.find((f) => f.id === prefs.fontId) || FONT_OPTIONS[0];
    root.style.setProperty('--er-font-family', language === 'bn' ? "'Noto Sans Bengali', " + face.family : face.family);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* Preference storage optional */ }
  }, [prefs, language]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceValue {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('AppearanceProvider is required');
  return value;
}
