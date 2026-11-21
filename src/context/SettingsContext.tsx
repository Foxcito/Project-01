import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { UserSettings, ThemeMode, GestureDirection, SensitivityLevel, AlbumActionMode } from '@/types/settings';
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
  setGestureDirection: (direction: GestureDirection) => Promise<void>;
  setSensitivity: (sensitivity: SensitivityLevel) => Promise<void>;
  setAlbumActionMode: (mode: AlbumActionMode) => Promise<void>;
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
    const nextTheme: ThemeMode = settings.theme === 'oled' ? 'vintage' : 'oled';
    await setTheme(nextTheme);
  }, [settings.theme, setTheme]);

  const setGestureDirection = useCallback(async (direction: GestureDirection) => {
    await updateSetting('gestureDirection', direction);
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
          totalBytesFreed: prev.stats.totalBytesFreed + bytesFreed,
          totalReviewed: prev.stats.totalReviewed + reviewed,
          totalTrashed: prev.stats.totalTrashed + trashed,
          totalOrganized: prev.stats.totalOrganized + organized,
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
        setGestureDirection,
        setSensitivity,
        setAlbumActionMode,
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
