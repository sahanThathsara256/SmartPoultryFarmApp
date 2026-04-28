import {create} from 'zustand';
import {loadItem, saveItem, STORAGE_KEYS} from '@utils/storage';
import {ThemeMode} from '@theme/colors';

type ThemeState = {
  themeMode: ThemeMode;
  hydrated: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleThemeMode: () => Promise<void>;
  hydrateThemeMode: () => Promise<void>;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'dark',
  hydrated: false,
  async setThemeMode(mode) {
    set({themeMode: mode, hydrated: true});
    await saveItem(STORAGE_KEYS.themeMode, mode);
  },
  async toggleThemeMode() {
    const nextMode = get().themeMode === 'dark' ? 'light' : 'dark';
    await get().setThemeMode(nextMode);
  },
  async hydrateThemeMode() {
    const saved = await loadItem<ThemeMode>(STORAGE_KEYS.themeMode);
    set({
      themeMode: saved === 'light' ? 'light' : 'dark',
      hydrated: true,
    });
  },
}));
