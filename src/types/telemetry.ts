export interface TelemetryData {
  temperature: number;
  humidity: number;
  waterLevel: number;
  feedLevel: number;
  lightLevel?: number;  // LDR sensor reading (0-100%)
  ldr?: number;         // Raw LDR value (0-4095)
  lightOn: boolean;
  fanOn: boolean;
  heaterOn: boolean;
  pumpOn: boolean;
  feedMotorOn: boolean;
  sprayerOn?: boolean;
  autoLightMode?: boolean;
  autoTempMode?: boolean;
  tempMin?: number;
  tempMax?: number;
  autoWaterPumpMode?: boolean;
  waterPumpLow?: number;
  waterPumpHigh?: number;
  alerts?: string[];
  uptime?: number;
  timestamp: string;
}

export interface AutomationRules {
  temperature: {
    enabled: boolean;
    maxTemp: number;
    minTemp: number;
  };
  humidity: {
    enabled: boolean;
    minHumidity: number;
    maxHumidity: number;
  };
  water: {
    autoMode: boolean;
    minLevel: number;
    maxLevel: number; // Added to match ESP32
    targetLevel: number;
  };
  feed: {
    autoAlert: boolean;
    minLevel: number;
  };
  lightSchedule: {
    enabled: boolean;
    onTime: string;
    offTime: string;
  };
}

export interface DeviceSettings {
  brokerUrl: string;
  port: number;
  username?: string;
  password?: string;
  deviceId: string;
  mockMode?: boolean;
  transport?: 'mqtt' | 'firebase' | 'http';
  firebase?: {
    apiKey?: string;
    projectId?: string;
    appId?: string;
    databaseURL?: string;
  };
}

export type ControlTarget =
  | 'light'
  | 'fan'
  | 'heater'
  | 'pump'
  | 'feedMotor'
  | 'sprayer';

export interface ControlCommand {
  target: ControlTarget;
  action: 'on' | 'off' | 'toggle';
}
