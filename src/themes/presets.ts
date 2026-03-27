export type ThemePreset = {
  id: string;
  name: string;
  dataTheme: string;
};

export const themePresets: ThemePreset[] = [
  { id: 'dark', name: 'Dark', dataTheme: '' },
  { id: 'light', name: 'Light', dataTheme: 'light' },
  { id: 'high-contrast', name: 'High Contrast', dataTheme: 'high-contrast' },
];

export function applyTheme(dataTheme: string): void {
  if (dataTheme) {
    document.documentElement.setAttribute('data-theme', dataTheme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function getSavedTheme(): ThemePreset {
  const saved = localStorage.getItem('webos-theme');
  if (saved) {
    const preset = themePresets.find((p) => p.id === saved);
    if (preset) return preset;
  }
  return themePresets[0];
}

export function saveTheme(presetId: string): void {
  localStorage.setItem('webos-theme', presetId);
}
