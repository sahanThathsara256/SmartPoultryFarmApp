import {create} from 'zustand';
import {DeviceSettings} from '@types';
import {defaultSettings} from '@utils/config';
import {loadItem, saveItem, STORAGE_KEYS} from '@utils/storage';

interface DeviceState {
  settings: DeviceSettings;
  status: 'idle' | 'connecting' | 'connected' | 'error';
  error?: string;
  hydrated: boolean;
  setSettings: (settings: DeviceSettings) => Promise<void>;
  loadSettings: () => Promise<void>;
  setStatus: (status: DeviceState['status'], error?: string) => void;
  toggleMockMode: (value: boolean) => Promise<void>;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  settings: defaultSettings,
  status: 'idle',
  hydrated: false,
  async setSettings(settings) {
    set({settings, hydrated: true});
    await saveItem(STORAGE_KEYS.deviceSettings, settings);
  },
  async loadSettings() {
    const saved = await loadItem<DeviceSettings>(STORAGE_KEYS.deviceSettings);
    set({settings: saved ? {...defaultSettings, ...saved} : defaultSettings, hydrated: true});
  },
  setStatus(status, error) {
    set({status, error});
  },
  async toggleMockMode(value) {
    const updated = {...get().settings, mockMode: value};
    set({settings: updated});
    await saveItem(STORAGE_KEYS.deviceSettings, updated);
  },
}));
