import { useState, useEffect, useCallback } from 'react';

export interface Settings {
  autoNext: boolean;
  timerSoundEnabled: boolean;
  timerSoundId: string; // 'default', 'beep', 'chime', 'custom'
  customTimerSound?: string; // Base64 Data URI for custom audio
}

const DEFAULT_SETTINGS: Settings = {
  autoNext: false,
  timerSoundEnabled: true,
  timerSoundId: 'default',
};

const STORAGE_KEY = 'app-settings';

/**
 * Hook for managing application settings.
 * Settings are persisted in localStorage.
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
};
