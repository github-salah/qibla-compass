import { useEffect, useState } from 'react';
import { AccessibilityInfo, PixelRatio } from 'react-native';

interface AccessibilityPreferences {
  boldTextEnabled: boolean;
  reduceMotionEnabled: boolean;
  screenReaderEnabled: boolean;
  fontScale: number;
  highContrast: boolean;
}

export const useAccessibilityPreferences = (): AccessibilityPreferences => {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({
    boldTextEnabled: false,
    reduceMotionEnabled: false,
    screenReaderEnabled: false,
    fontScale: PixelRatio.getFontScale?.() || 1,
    highContrast: false,
  });

  useEffect(() => {
    let mounted = true;
    const update = async () => {
      try {
        const [bold, reduceMotion, sr] = await Promise.all([
          AccessibilityInfo.isBoldTextEnabled?.() ?? Promise.resolve(false),
          AccessibilityInfo.isReduceMotionEnabled?.() ?? Promise.resolve(false),
          AccessibilityInfo.isScreenReaderEnabled?.() ?? Promise.resolve(false),
        ]);
        const fontScale = PixelRatio.getFontScale?.() || 1;
        if (mounted) {
          setPrefs({
            boldTextEnabled: bold,
            reduceMotionEnabled: reduceMotion,
            screenReaderEnabled: sr,
            fontScale,
            highContrast: bold || fontScale > 1.25,
          });
        }
      } catch {
        // silently ignore
      }
    };
    update();
    const listener = AccessibilityInfo.addEventListener?.('boldTextChanged', () => update());
    const listener2 = AccessibilityInfo.addEventListener?.('reduceMotionChanged', () => update());
    const listener3 = AccessibilityInfo.addEventListener?.('screenReaderChanged', () => update());
    return () => {
      mounted = false;
      // RN >=0.65 returns subscription with remove
      (listener as any)?.remove?.();
      (listener2 as any)?.remove?.();
      (listener3 as any)?.remove?.();
    };
  }, []);

  return prefs;
};
