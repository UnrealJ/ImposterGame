import { useState, useEffect } from 'react';
import { GameSettings } from '../types';

const SETTINGS_KEY = 'imposter-settings';

const DEFAULT_SETTINGS: GameSettings = {
  revealDuration: 3,
  preventConsecutiveCard: true,
  noHintsForImposter: false,
  wildMode: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          revealDuration: parsed.revealDuration ?? DEFAULT_SETTINGS.revealDuration,
          preventConsecutiveCard:
            parsed.preventConsecutiveCard ?? DEFAULT_SETTINGS.preventConsecutiveCard,
          noHintsForImposter: parsed.noHintsForImposter ?? DEFAULT_SETTINGS.noHintsForImposter,
          wildMode: parsed.wildMode ?? DEFAULT_SETTINGS.wildMode,
        };
      }
    } catch {
      return DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      console.warn('Failed to save settings to localStorage');
    }
  }, [settings]);

  return { settings, setSettings };
};
