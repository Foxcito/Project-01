import { ThemeMode } from '@/types/settings';

export interface ColorPalette {
  name: string;
  isDark: boolean;
  background: string;
  surface: string;
  surfaceSubtle: string;
  card: string;
  border: string;
  borderGlow: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  trash: string;
  trashGlow: string;
  keep: string;
  keepGlow: string;
  primary: string;
  accent: string;
  amber: string;
  tabBarBg: string;
  glassBg: string;
  glassOverlay: string;
  tagBg: string;
}

export const THEMES: Record<ThemeMode, ColorPalette> = {
  oled: {
    name: 'Negro AMOLED',
    isDark: true,
    background: '#000000',
    surface: '#0A0C10',
    surfaceSubtle: '#141720',
    card: '#0D1017',
    border: 'rgba(255, 255, 255, 0.08)',
    borderGlow: 'rgba(56, 189, 248, 0.25)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#526075',
    trash: '#FF453A',
    trashGlow: 'rgba(255, 69, 58, 0.35)',
    keep: '#22C55E',
    keepGlow: 'rgba(34, 197, 94, 0.35)',
    primary: '#38BDF8',
    accent: '#00E5FF',
    amber: '#F59E0B',
    tabBarBg: 'rgba(0, 0, 0, 0.92)',
    glassBg: 'rgba(12, 16, 23, 0.75)',
    glassOverlay: 'rgba(255, 255, 255, 0.04)',
    tagBg: 'rgba(56, 189, 248, 0.12)',
  },
  vintage: {
    name: 'Vintage Cálido',
    isDark: false,
    background: '#F5EFEB',
    surface: '#EAE1D4',
    surfaceSubtle: '#DFD4C4',
    card: '#FAF6F0',
    border: 'rgba(75, 58, 42, 0.12)',
    borderGlow: 'rgba(196, 91, 62, 0.25)',
    text: '#2A241E',
    textSecondary: '#6B5F52',
    textMuted: '#9E9080',
    trash: '#B94432',
    trashGlow: 'rgba(185, 68, 50, 0.25)',
    keep: '#476E4B',
    keepGlow: 'rgba(71, 110, 75, 0.25)',
    primary: '#C45B3E',
    accent: '#C98A2C',
    amber: '#C98A2C',
    tabBarBg: 'rgba(245, 239, 235, 0.95)',
    glassBg: 'rgba(245, 239, 235, 0.88)',
    glassOverlay: 'rgba(75, 58, 42, 0.03)',
    tagBg: 'rgba(196, 91, 62, 0.12)',
  },
};
