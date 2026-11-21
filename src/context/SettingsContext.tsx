import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  UserSettings,
  ThemeMode,
  KeepGestureDirection,
  SensitivityLevel,
  AlbumActionMode,
  TrashRetention,
  MediaTypeFilter,
} from '@/types/settings';
import { loadUserSettings, saveUserSettings, DEFAULT_SETTINGS } from '@/utils/storage';
import { THEMES, ColorPalette } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';

interface SettingsContextValue {
  settings: UserSettings;
  colors: ColorPalette;
  isReady: boolean;
  haptics: ReturnType<typeof useHaptics>;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setKeepGestureDirection: (direction: KeepGestureDirection) => Promise<void>;
  setSensitivity: (sensitivity: SensitivityLevel) => Promise<void>;
  setAlbumActionMode: (mode: AlbumActionMode) => Promise<void>;
  setTrashRetention: (retention: TrashRetention) => Promise<void>;
  setMediaTypeFilter: (filter: MediaTypeFilter) => Promise<void>;
  toggleAutoplay: () => Promise<void>;
  toggleDefaultMuted: () => Promise<void>;
  toggleHaptics: () => Promise<void>;
  incrementStats: (params: { bytesFreed?: number; reviewed?: number; trashed?: number; organized?: number }) => Promise<void>;
  resetStats: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadUserSettings();
      if (mounted) {
        setSettings(stored);
        setIsReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const haptics = useHaptics(settings.hapticFeedback);

  const updateSetting = useCallback(async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveUserSettings(next);
      return next;
    });
  }, []);

  const setTheme = useCallback(async (theme: ThemeMode) => {
    await updateSetting('theme', theme);
    haptics.selection();
  }, [updateSetting, haptics]);

  const toggleTheme = useCallback(async () => {
    const themeCycle: ThemeMode[] = ['oled', 'vintage', 'graphite', 'nordic'];
    const currentIndex = themeCycle.indexOf(settings.theme);
    const nextTheme = themeCycle[(currentIndex + 1) % themeCycle.length];
    await setTheme(nextTheme);
  }, [settings.theme, setTheme]);

  const setKeepGestureDirection = useCallback(async (direction: KeepGestureDirection) => {
    await updateSetting('keepGestureDirection', direction);
    haptics.selection();
  }, [updateSetting, haptics]);

  const setSensitivity = useCallback(async (sensitivity: SensitivityLevel) => {
    await updateSetting('sensitivity', sensitivity);
    haptics.selection();
  }, [updateSetting, haptics]);

  const setAlbumActionMode = useCallback(async (mode: AlbumActionMode) => {
    await updateSetting('albumActionMode', mode);
    haptics.selection();
  }, [updateSetting, haptics]);

  const setTrashRetention = useCallback(async (retention: TrashRetention) => {
    await updateSetting('trashRetention', retention);
    haptics.selection();
  }, [updateSetting, haptics]);

  const setMediaTypeFilter = useCallback(async (filter: MediaTypeFilter) => {
    await updateSetting('mediaTypeFilter', filter);
    haptics.selection();
  }, [updateSetting, haptics]);

  const toggleAutoplay = useCallback(async () => {
    await updateSetting('autoplayVideos', !settings.autoplayVideos);
    haptics.selection();
  }, [updateSetting, settings.autoplayVideos, haptics]);

  const toggleDefaultMuted = useCallback(async () => {
    await updateSetting('defaultMuted', !settings.defaultMuted);
    haptics.selection();
  }, [updateSetting, settings.defaultMuted, haptics]);

  const toggleHaptics = useCallback(async () => {
    const nextVal = !settings.hapticFeedback;
    await updateSetting('hapticFeedback', nextVal);
  }, [updateSetting, settings.hapticFeedback]);

  const incrementStats = useCallback(async ({
    bytesFreed = 0,
    reviewed = 0,
    trashed = 0,
    organized = 0,
  }: {
    bytesFreed?: number;
    reviewed?: number;
    trashed?: number;
    organized?: number;
  }) => {
    setSettings((prev) => {
      const next: UserSettings = {
        ...prev,
        stats: {
          totalBytesFreed: Math.max(0, (prev.stats?.totalBytesFreed || 0) + bytesFreed),
          totalReviewed: Math.max(0, (prev.stats?.totalReviewed || 0) + reviewed),
          totalTrashed: Math.max(0, (prev.stats?.totalTrashed || 0) + trashed),
          totalOrganized: Math.max(0, (prev.stats?.totalOrganized || 0) + organized),
        },
      };
      saveUserSettings(next);
      return next;
    });
  }, []);

  const resetStats = useCallback(async () => {
    setSettings((prev) => {
      const next: UserSettings = {
        ...prev,
        stats: {
          totalBytesFreed: 0,
          totalReviewed: 0,
          totalTrashed: 0,
          totalOrganized: 0,
        },
      };
      saveUserSettings(next);
      return next;
    });
    haptics.impactMedium();
  }, [haptics]);

  const colors = THEMES[settings.theme] || THEMES.oled;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        colors,
        isReady,
        haptics,
        updateSetting,
        setTheme,
        toggleTheme,
        setKeepGestureDirection,
        setSensitivity,
        setAlbumActionMode,
        setTrashRetention,
        setMediaTypeFilter,
        toggleAutoplay,
        toggleDefaultMuted,
        toggleHaptics,
        incrementStats,
        resetStats,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
