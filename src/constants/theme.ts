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
  graphite: {
    name: 'Grafito Mate',
    isDark: true,
    background: '#111215',
    surface: '#181A20',
    surfaceSubtle: '#22252D',
    card: '#1D2027',
    border: 'rgba(255, 255, 255, 0.08)',
    borderGlow: 'rgba(245, 158, 11, 0.25)',
    text: '#F1F3F7',
    textSecondary: '#9CA3AF',
    textMuted: '#5B6270',
    trash: '#F43F5E',
    trashGlow: 'rgba(244, 63, 94, 0.32)',
    keep: '#10B981',
    keepGlow: 'rgba(16, 185, 129, 0.32)',
    primary: '#F59E0B',
    accent: '#FBBF24',
    amber: '#F59E0B',
    tabBarBg: 'rgba(17, 18, 21, 0.94)',
    glassBg: 'rgba(24, 26, 32, 0.8)',
    glassOverlay: 'rgba(255, 255, 255, 0.03)',
    tagBg: 'rgba(245, 158, 11, 0.14)',
  },
  nordic: {
    name: 'Bruma Nórdica',
    isDark: true,
    background: '#0C1017',
    surface: '#141B26',
    surfaceSubtle: '#1E2838',
    card: '#182230',
    border: 'rgba(125, 211, 252, 0.12)',
    borderGlow: 'rgba(125, 211, 252, 0.28)',
    text: '#F0F6FC',
    textSecondary: '#8B9CB3',
    textMuted: '#4B5E78',
    trash: '#FB7185',
    trashGlow: 'rgba(251, 113, 133, 0.32)',
    keep: '#34D399',
    keepGlow: 'rgba(52, 211, 153, 0.32)',
    primary: '#7DD3FC',
    accent: '#38BDF8',
    amber: '#FBBF24',
    tabBarBg: 'rgba(12, 16, 23, 0.94)',
    glassBg: 'rgba(20, 27, 38, 0.8)',
    glassOverlay: 'rgba(125, 211, 252, 0.03)',
    tagBg: 'rgba(125, 211, 252, 0.14)',
  },
};
