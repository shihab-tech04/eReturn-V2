/** Compatibility bridge: exact Sobaike Janao UI components with eReturn-owned appearance state. */
import { useAppearance } from '../appearance/AppearanceProvider';
export type ThemePreference = 'light' | 'dark' | 'system';
export const useTheme = () => {
  const { themeId, setThemeId, fontSizeId, setFontSizeId } = useAppearance();
  const resolvedTheme: 'light' | 'dark' =
    themeId === 'system'
      ? (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : themeId;
  return {
    themePreference: themeId,
    setThemePreference: setThemeId,
    resolvedTheme,
    textSizePreference: fontSizeId,
    setTextSizePreference: setFontSizeId,
  };
};
