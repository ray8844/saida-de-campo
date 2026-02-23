import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings } from '../types';
import { profileService } from '../services/profileService';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isLoaded: boolean;
}

const defaultSettings: Settings = {
  theme: 'claro',
  font_size: 'media',
  layout_mode: 'padrao'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      // Try local storage first for instant load
      const local = localStorage.getItem('app_settings');
      if (local) {
        setSettings(JSON.parse(local));
      }

      // Then try DB
      const profile = await profileService.getProfile();
      if (profile) {
        const dbSettings = {
          theme: profile.theme,
          font_size: profile.font_size,
          layout_mode: profile.layout_mode
        };
        setSettings(dbSettings);
        localStorage.setItem('app_settings', JSON.stringify(dbSettings));
      }
      setIsLoaded(true);
    };

    loadSettings();
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    const isDark = settings.theme === 'escuro' || 
                  (settings.theme === 'automatico' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply font size
    root.setAttribute('data-font-size', settings.font_size);
    // Apply layout mode (high contrast)
    root.setAttribute('data-layout', settings.layout_mode);
  }, [settings]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('app_settings', JSON.stringify(updated));
    await profileService.updateSettings(updated);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
