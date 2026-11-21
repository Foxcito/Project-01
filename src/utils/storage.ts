import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '@/types/settings';
import { TrashItem } from '@/types/media';

const SETTINGS_KEY = '@foxcito_cleaner:settings';
const TRASH_KEY = '@foxcito_cleaner:trash_items';
const REVIEWED_IDS_KEY = '@foxcito_cleaner:reviewed_ids';

export const DEFAULT_SETTINGS: UserSettings = {
  gestureDirection: 'vertical',
  sensitivity: 'medium',
  albumActionMode: 'move',
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

export async function loadUserSettings(): Promise<UserSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const normalizedTheme = parsed.theme === 'vintage' ? 'vintage' : 'oled';
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      theme: normalizedTheme,
      stats: {
        ...DEFAULT_SETTINGS.stats,
        ...(parsed.stats || {}),
      },
    };
  } catch (err) {
    console.error('Error loading user settings from AsyncStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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
