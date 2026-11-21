import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, ThemeMode, KeepGestureDirection, TrashRetention, MediaTypeFilter } from '@/types/settings';
import { TrashItem, SourceProgress } from '@/types/media';

const SETTINGS_KEY = '@foxcito_cleaner:settings';
const TRASH_KEY = '@foxcito_cleaner:trash_items';
const REVIEWED_IDS_KEY = '@foxcito_cleaner:reviewed_ids';

export const DEFAULT_SETTINGS: UserSettings = {
  keepGestureDirection: 'left',
  sensitivity: 'medium',
  albumActionMode: 'move',
  trashRetention: 'forever',
  mediaTypeFilter: 'all',
  autoplayVideos: true,
  defaultMuted: true,
  hapticFeedback: true,
  theme: 'oled',
  stats: {
    totalBytesFreed: 0,
    totalReviewed: 0,
    totalTrashed: 0,
    totalOrganized: 0,
  },
};

const VALID_THEMES: ThemeMode[] = ['oled', 'vintage', 'graphite', 'nordic'];

export async function loadUserSettings(): Promise<UserSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);

    const theme: ThemeMode = VALID_THEMES.includes(parsed.theme) ? parsed.theme : 'oled';
    const keepGestureDirection: KeepGestureDirection =
      parsed.keepGestureDirection === 'down' ? 'down' : 'left';
    const trashRetention: TrashRetention =
      parsed.trashRetention === '30_days' ? '30_days' : 'forever';
    const mediaTypeFilter: MediaTypeFilter =
      parsed.mediaTypeFilter === 'photo' || parsed.mediaTypeFilter === 'video'
        ? parsed.mediaTypeFilter
        : 'all';

    const rawStats = parsed.stats || {};
    const stats = {
      totalBytesFreed: Math.max(0, Number(rawStats.totalBytesFreed) || 0),
      totalReviewed: Math.max(0, Number(rawStats.totalReviewed) || 0),
      totalTrashed: Math.max(0, Number(rawStats.totalTrashed) || 0),
      totalOrganized: Math.max(0, Number(rawStats.totalOrganized) || 0),
    };

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      theme,
      keepGestureDirection,
      trashRetention,
      mediaTypeFilter,
      stats,
    };
  } catch (err) {
    console.error('Error loading user settings from AsyncStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    // Asegurar que las estadísticas nunca se guarden con números negativos
    const safeSettings: UserSettings = {
      ...settings,
      stats: {
        totalBytesFreed: Math.max(0, settings.stats.totalBytesFreed || 0),
        totalReviewed: Math.max(0, settings.stats.totalReviewed || 0),
        totalTrashed: Math.max(0, settings.stats.totalTrashed || 0),
        totalOrganized: Math.max(0, settings.stats.totalOrganized || 0),
      },
    };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(safeSettings));
  } catch (err) {
    console.error('Error saving user settings to AsyncStorage:', err);
  }
}

export async function loadTrashItems(): Promise<TrashItem[]> {
  try {
    const raw = await AsyncStorage.getItem(TRASH_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading trash items from AsyncStorage:', err);
    return [];
  }
}

export async function saveTrashItems(items: TrashItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TRASH_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving trash items to AsyncStorage:', err);
  }
}

export async function loadReviewedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(REVIEWED_IDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading reviewed IDs from AsyncStorage:', err);
    return [];
  }
}

export async function saveReviewedIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(REVIEWED_IDS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Error saving reviewed IDs to AsyncStorage:', err);
  }
}

const SOURCE_PROGRESS_KEY = '@foxcito_cleaner:source_progress';

export async function loadSourceProgress(): Promise<Record<string, SourceProgress>> {
  try {
    const raw = await AsyncStorage.getItem(SOURCE_PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading source progress from AsyncStorage:', err);
    return {};
  }
}

export async function saveSourceProgress(
  progress: Record<string, SourceProgress>
): Promise<void> {
  try {
    await AsyncStorage.setItem(SOURCE_PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Error saving source progress to AsyncStorage:', err);
  }
}

