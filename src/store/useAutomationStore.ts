import {create, StateCreator} from 'zustand';
import {AutomationRules} from '@types';
import {loadItem, saveItem, STORAGE_KEYS} from '@utils/storage';

const defaultRules: AutomationRules = {
  temperature: {
    enabled: true,
    maxTemp: 32,
    minTemp: 25,
  },
  humidity: {
    enabled: true,
    minHumidity: 45,
    maxHumidity: 70,
  },
  water: {
    autoMode: true,
    minLevel: 20,
    targetLevel: 80,
  },
  feed: {
    autoAlert: true,
    minLevel: 15,
  },
  lightSchedule: {
    enabled: true,
    onTime: '18:00',
    offTime: '06:00',
  },
};

export interface AutomationState {
  rules: AutomationRules;
  loading: boolean;
  setRules: (rules: AutomationRules) => Promise<void>;
  loadRules: () => Promise<void>;
}

const store: StateCreator<AutomationState> = (set, get) => ({
  rules: defaultRules,
  loading: false,
  async setRules(rules) {
    set({rules});
    await saveItem(STORAGE_KEYS.automationRules, rules);
  },
  async loadRules() {
    set({loading: true});
    const saved = await loadItem<AutomationRules>(STORAGE_KEYS.automationRules);
    set({rules: saved || get().rules, loading: false});
  },
});

export const useAutomationStore = create<AutomationState>(store);
