import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  deviceSettings: '@smart-poultry/device-settings',
  automationRules: '@smart-poultry/automation-rules',
  auth: '@smart-poultry/auth',
};

export const loadItem = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.warn('Failed to load storage item', key, error);
    return null;
  }
};

export const saveItem = async <T>(key: string, value: T) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to persist storage item', key, error);
  }
};
