import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { themePresets, applyTheme, getSavedTheme, saveTheme } from './presets';
import type { ThemePreset } from './presets';

interface ThemeContextValue {
  currentTheme: ThemePreset;
  themes: ThemePreset[];
  setTheme: (preset: ThemePreset) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  currentTheme: themePresets[0],
  themes: themePresets,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>(getSavedTheme);

  useEffect(() => {
    applyTheme(currentTheme.dataTheme);
  }, [currentTheme]);

  const setTheme = useCallback((preset: ThemePreset) => {
    setCurrentTheme(preset);
    saveTheme(preset.id);
    applyTheme(preset.dataTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, themes: themePresets, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
