import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// Using require to avoid TS module resolution issues if types not found
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');

export interface Preferences {
  themeMode: 'system' | 'light' | 'dark';
  highContrastEnabled: boolean;
  reduceMotionEnabled: boolean;
  announceAccessibility: boolean;
  hapticsEnabled: boolean;
  toleranceDeg: number; // compass alignment tolerance
  headingIntervalMs: number; // sensor update interval
  largeTextBoost: boolean; // extra scaling beyond system
  locationDenied: boolean; // user denied location; prefer manual city
  showBearingIcon: boolean; // display user bearing icon in compass
  hasSeenCompassTutorial: boolean; // one-time tutorial flag
  askForRatings?: boolean; // allow in-app ratings prompt
  hasPromptedForRating?: boolean; // prompt shown once
}

const DEFAULT_PREFERENCES: Preferences = {
  themeMode: 'system',
  highContrastEnabled: false,
  reduceMotionEnabled: false,
  announceAccessibility: false,
  hapticsEnabled: true,
  toleranceDeg: 5,
  headingIntervalMs: 50,
  largeTextBoost: false,
  locationDenied: false,
  showBearingIcon: true,
  hasSeenCompassTutorial: false,
  askForRatings: true,
  hasPromptedForRating: false,
};

interface PreferencesContextType {
  prefs: Preferences;
  update: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  batchUpdate: (partial: Partial<Preferences>) => void;
  reset: () => void;
  loaded: boolean;
}

const PreferencesContext = createContext<PreferencesContextType>({
  prefs: DEFAULT_PREFERENCES,
  update: () => {},
  batchUpdate: () => {},
  reset: () => {},
  loaded: false,
});

const STORAGE_KEY = 'user_preferences_v1';

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setPrefs({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      } catch (e) {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
    })();
  }, [prefs, loaded]);

  const update: PreferencesContextType['update'] = (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const batchUpdate: PreferencesContextType['batchUpdate'] = (partial) => {
    setPrefs(prev => ({ ...prev, ...partial }));
  };

  const reset = () => setPrefs(DEFAULT_PREFERENCES);

  return (
    <PreferencesContext.Provider value={{ prefs, update, batchUpdate, reset, loaded }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
