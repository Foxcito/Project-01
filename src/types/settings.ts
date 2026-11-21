export type GestureDirection = 'vertical' | 'horizontal';
// 'vertical': Deslizar arriba = Papelera, Deslizar abajo = Conservar
// 'horizontal': Deslizar izquierda = Papelera, Deslizar derecha = Conservar

export type SensitivityLevel = 'low' | 'medium' | 'high';
export type AlbumActionMode = 'move' | 'copy';
export type ThemeMode = 'oled' | 'vintage';

export interface UserStats {
  totalBytesFreed: number;
  totalReviewed: number;
  totalTrashed: number;
  totalOrganized: number;
}

export interface UserSettings {
  gestureDirection: GestureDirection;
  sensitivity: SensitivityLevel;
  albumActionMode: AlbumActionMode;
  autoplayVideos: boolean;
  defaultMuted: boolean;
  hapticFeedback: boolean;
  theme: ThemeMode;
  stats: UserStats;
}
