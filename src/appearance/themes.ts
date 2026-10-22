/** Visual parity adapter for Sobaike Janao Public, source main cec3cef2a298c64439be25cc3b0018b02bf7c8b9
 * Source: src/index.css semantic --ui-* light/dark tokens.
 * This maps public visual tokens to eReturn's existing --er-* consumers;
 * it must never be used as a source of statutory tax figures.
 */
export type ThemeId = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  light: {
    id: 'light', name: 'Light',
    primary: '#1B4D6B', primaryDark: '#163B52', primaryLight: '#F0F2F5',
    secondary: '#3A7CA5', accent: '#38ad8c',
    background: '#F0F2F5', surface: '#FFFFFF', border: '#E4E6EB',
    textPrimary: '#050505', textSecondary: '#65676B',
    success: '#15803D', warning: '#B45309', error: '#B91C1C',
  },
  dark: {
    id: 'dark', name: 'Dark',
    primary: '#1B4D6B', primaryDark: '#163B52', primaryLight: '#3A3B3C',
    secondary: '#3A7CA5', accent: '#38ad8c',
    background: '#18191A', surface: '#242526', border: '#3A3B3C',
    textPrimary: '#E4E6EB', textSecondary: '#B0B3B8',
    success: '#86EFAC', warning: '#FCD34D', error: '#FCA5A5',
  },
  system: {
    id: 'system', name: 'System',
    primary: '#1B4D6B', primaryDark: '#163B52', primaryLight: '#F0F2F5',
    secondary: '#3A7CA5', accent: '#38ad8c',
    background: '#F0F2F5', surface: '#FFFFFF', border: '#E4E6EB',
    textPrimary: '#050505', textSecondary: '#65676B',
    success: '#15803D', warning: '#B45309', error: '#B91C1C',
  },
};

export const THEME_ORDER: ThemeId[] = ['light', 'dark', 'system'];
