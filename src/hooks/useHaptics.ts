import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export function useHaptics(enabled: boolean = true) {
  const impactLight = useCallback(() => {
    if (!enabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore if not supported on platform
    }
  }, [enabled]);

  const impactMedium = useCallback(() => {
    if (!enabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
  }, [enabled]);

  const impactHeavy = useCallback(() => {
    if (!enabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Ignore
    }
  }, [enabled]);

  const notificationSuccess = useCallback(() => {
    if (!enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }
  }, [enabled]);

  const notificationWarning = useCallback(() => {
    if (!enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore
    }
  }, [enabled]);

  const selection = useCallback(() => {
    if (!enabled) return;
    try {
      Haptics.selectionAsync();
    } catch {
      // Ignore
    }
  }, [enabled]);

  return {
    impactLight,
    impactMedium,
    impactHeavy,
    notificationSuccess,
    notificationWarning,
    selection,
  };
}
