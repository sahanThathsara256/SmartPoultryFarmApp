import {create} from 'zustand';
import {HistoryEvent, NotificationItem} from '@types';

interface EventsState {
  notifications: NotificationItem[];
  history: HistoryEvent[];
  addNotification: (item: NotificationItem) => void;
  addHistoryEvent: (item: HistoryEvent) => void;
  clearNotifications: () => void;
}

const seedNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Feed level low',
    message: 'Feed dropped below 18%. Refill soon.',
    type: 'warning',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Pump cycle complete',
    message: 'Water tank refilled to 82%.',
    type: 'info',
    timestamp: new Date().toISOString(),
  },
];

const seedHistory: HistoryEvent[] = [
  {
    id: 'h1',
    description: 'Fan auto ON (temp > 32°C)',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'h2',
    description: 'Heater manually turned OFF',
    timestamp: new Date().toISOString(),
  },
];

export const useEventsStore = create<EventsState>(set => ({
  notifications: seedNotifications,
  history: seedHistory,
  addNotification(item) {
    set(state => ({notifications: [item, ...state.notifications].slice(0, 20)}));
  },
  addHistoryEvent(item) {
    set(state => ({history: [item, ...state.history].slice(0, 50)}));
  },
  clearNotifications() {
    set({notifications: []});
  },
}));
