import {AutomationRules, ControlCommand, DeviceSettings, TelemetryData} from '@types';
import {DeviceApi} from './deviceApi';

class MockDeviceApi implements DeviceApi {
  private interval?: ReturnType<typeof setInterval>;
  private lastTelemetry: TelemetryData = this.generateTelemetry();

  async connect(_settings: DeviceSettings): Promise<void> {
    // No-op for mock
  }

  async disconnect(): Promise<void> {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  subscribeTelemetry(onMessage: (payload: TelemetryData) => void): () => void {
    this.interval = setInterval(() => {
      this.lastTelemetry = this.generateTelemetry();
      onMessage(this.lastTelemetry);
    }, 1500);

    onMessage(this.lastTelemetry);

    return () => {
      if (this.interval) {
        clearInterval(this.interval);
      }
    };
  }

  async publishCommand(command: ControlCommand): Promise<void> {
    // Immediately reflect optimistic state in telemetry snapshot for mock mode
    this.lastTelemetry = {
      ...this.lastTelemetry,
      [`${command.target}On` as keyof TelemetryData]: command.action === 'on',
      timestamp: new Date().toISOString(),
    } as TelemetryData;
  }

  async publishRules(rules: AutomationRules): Promise<void> {
    this.lastTelemetry = {
      ...this.lastTelemetry,
      autoLightMode: rules.lightSchedule.enabled,
      autoTempMode: rules.temperature.enabled || rules.humidity.enabled,
      autoWaterPumpMode: rules.water.autoMode,
      timestamp: new Date().toISOString(),
    };
  }

  async testConnection(_settings: DeviceSettings): Promise<boolean> {
    return true;
  }

  private generateTelemetry(): TelemetryData {
    return {
      temperature: 24 + Math.random() * 8,
      humidity: 40 + Math.random() * 30,
      waterLevel: 30 + Math.random() * 60,
      feedLevel: 20 + Math.random() * 70,
      lightOn: Math.random() > 0.5,
      fanOn: Math.random() > 0.5,
      heaterOn: Math.random() > 0.5,
      pumpOn: Math.random() > 0.5,
      feedMotorOn: Math.random() > 0.5,
      sprayerOn: Math.random() > 0.5,
      autoLightMode: true,
      autoTempMode: true,
      autoWaterPumpMode: true,
      timestamp: new Date().toISOString(),
    };
  }
}

export const mockDeviceApi = new MockDeviceApi();
