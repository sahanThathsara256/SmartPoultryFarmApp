export * from './telemetry';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface HistoryEvent {
  id: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
