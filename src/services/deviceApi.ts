import {AutomationRules, ControlCommand, DeviceSettings, TelemetryData} from '@types';

export interface DeviceApi {
  connect(settings: DeviceSettings): Promise<void>;
  disconnect(): Promise<void>;
  subscribeTelemetry(onMessage: (payload: TelemetryData) => void): () => void;
  publishCommand(command: ControlCommand): Promise<void>;
  publishRules(rules: AutomationRules): Promise<void>;
  testConnection(settings: DeviceSettings): Promise<boolean>;
}
