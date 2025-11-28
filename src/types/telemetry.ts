export interface TelemetryData {
  temperature: number;
  humidity: number;
  waterLevel: number;
  feedLevel: number;
  lightOn: boolean;
  fanOn: boolean;
  heaterOn: boolean;
  pumpOn: boolean;
  feedMotorOn: boolean;
  sprayerOn?: boolean;
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
  action: 'on' | 'off';
}
