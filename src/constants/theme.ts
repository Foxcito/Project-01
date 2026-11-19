import { ThemeMode } from '@/types/settings';

export interface ColorPalette {
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
}

export const THEMES: Record<ThemeMode, ColorPalette> = {
  oled: {
    background: '#000000',
    surface: '#0A0A0A',
    surfaceSubtle: '#141414',
    card: '#0D0E12',
    border: 'rgba(255, 255, 255, 0.12)',
    borderGlow: 'rgba(255, 255, 255, 0.22)',
    text: '#FFFFFF',
    textSecondary: '#A0A0A5',
    textMuted: '#636366',
    trash: '#FF453A',
    trashGlow: 'rgba(255, 69, 58, 0.35)',
    keep: '#30D158',
    keepGlow: 'rgba(48, 209, 88, 0.35)',
    primary: '#0A84FF',
    accent: '#64D2FF',
    amber: '#FF9F0A',
    tabBarBg: 'rgba(10, 10, 10, 0.85)',
    glassBg: 'rgba(20, 20, 24, 0.65)',
    glassOverlay: 'rgba(255, 255, 255, 0.04)',
  },
  glass_dark: {
    background: '#0A0E17',
    surface: '#111827',
    surfaceSubtle: '#1F2937',
    card: '#161F30',
    border: 'rgba(255, 255, 255, 0.16)',
    borderGlow: 'rgba(56, 189, 248, 0.3)',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    trash: '#F43F5E',
    trashGlow: 'rgba(244, 63, 94, 0.35)',
    keep: '#10B981',
    keepGlow: 'rgba(16, 185, 129, 0.35)',
    primary: '#38BDF8',
    accent: '#818CF8',
    amber: '#F59E0B',
    tabBarBg: 'rgba(15, 23, 42, 0.85)',
    glassBg: 'rgba(30, 41, 59, 0.6)',
    glassOverlay: 'rgba(255, 255, 255, 0.05)',
  },
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F3F5',
    card: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.08)',
    borderGlow: 'rgba(0, 0, 0, 0.15)',
    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    trash: '#EF4444',
    trashGlow: 'rgba(239, 68, 68, 0.25)',
    keep: '#10B981',
    keepGlow: 'rgba(16, 185, 129, 0.25)',
    primary: '#2563EB',
    accent: '#0284C7',
    amber: '#D97706',
    tabBarBg: 'rgba(255, 255, 255, 0.92)',
    glassBg: 'rgba(255, 255, 255, 0.8)',
    glassOverlay: 'rgba(0, 0, 0, 0.02)',
  },
};
