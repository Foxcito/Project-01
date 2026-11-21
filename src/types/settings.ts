export type KeepGestureDirection = 'left' | 'down';
// Deslizar arriba = Papelera (siempre)
// Deslizar según keepGestureDirection: 'left' (por defecto) o 'down' = Conservar

export type SensitivityLevel = 'low' | 'medium' | 'high';
export type AlbumActionMode = 'move' | 'copy';
export type ThemeMode = 'oled' | 'vintage' | 'graphite' | 'nordic';
export type TrashRetention = '30_days' | 'forever';
export type MediaTypeFilter = 'all' | 'photo' | 'video';

export interface UserStats {
  totalBytesFreed: number;
  totalReviewed: number;
  totalTrashed: number;
  totalOrganized: number;
}

export interface UserSettings {
  keepGestureDirection: KeepGestureDirection;
  sensitivity: SensitivityLevel;
  albumActionMode: AlbumActionMode;
  trashRetention: TrashRetention;
  mediaTypeFilter: MediaTypeFilter;
  autoplayVideos: boolean;
  defaultMuted: boolean;
  hapticFeedback: boolean;
  theme: ThemeMode;
  stats: UserStats;
}
