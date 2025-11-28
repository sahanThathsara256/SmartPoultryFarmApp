import {connect, IClientOptions, ISubscriptionGrant, MqttClient as RawClient} from 'mqtt';
import {Buffer} from 'buffer';
import {AutomationRules, ControlCommand, DeviceSettings, TelemetryData} from '@types';
import {commandTopic, rulesTopic, telemetryTopic} from '@utils/config';
import {DeviceApi} from './deviceApi';

class MqttDeviceClient implements DeviceApi {
  private client?: RawClient;
  private currentSettings?: DeviceSettings;
  private telemetryUnsub?: () => void;

  async connect(settings: DeviceSettings): Promise<void> {
    if (this.client && this.client.connected) {
      return;
    }

    this.currentSettings = settings;

    const options: IClientOptions = {
      username: settings.username,
      password: settings.password,
      reconnectPeriod: 3000,
      connectTimeout: 10_000,
      protocol: settings.brokerUrl.startsWith('wss') ? 'wss' : 'ws',
      port: settings.port,
    };

    await new Promise<void>((resolve, reject) => {
      const client = connect(settings.brokerUrl, options);
      this.client = client;

      const handleConnect = () => {
        client.removeListener('error', handleError);
        resolve();
      };

      const handleError = (error: Error) => {
        client.removeListener('connect', handleConnect);
        reject(error);
      };

      client.once('connect', handleConnect);
      client.once('error', handleError);
    });
  }

  async disconnect(): Promise<void> {
    return new Promise(resolve => {
      if (!this.client) {
        resolve();
        return;
      }
      this.client.end(true, {}, () => {
        this.client = undefined;
        this.telemetryUnsub?.();
        resolve();
      });
    });
  }

  subscribeTelemetry(onMessage: (payload: TelemetryData) => void): () => void {
    if (!this.client || !this.currentSettings) {
      throw new Error('MQTT client not connected');
    }

    const topic = telemetryTopic(this.currentSettings.deviceId);
    // ESP32 should publish JSON like:
    // { "temperature": 28.4, "humidity": 62, "pumpOn": false, "timestamp": "2024-01-15T10:22:11Z" }
    const listener = (incomingTopic: string, message: Buffer) => {
      if (incomingTopic !== topic) {
        return;
      }
      try {
        const parsed: TelemetryData = JSON.parse(message.toString());
        onMessage({...parsed, timestamp: parsed.timestamp || new Date().toISOString()});
      } catch (error) {
        console.warn('Invalid telemetry payload', error);
      }
    };

    this.client.subscribe(topic, {qos: 1}, (err: Error | null, _granted?: ISubscriptionGrant[]) => {
      if (err) {
        console.warn('Failed to subscribe telemetry', err);
      }
    });
    this.client.on('message', listener);

    this.telemetryUnsub = () => {
      this.client?.unsubscribe(topic);
      this.client?.off('message', listener);
    };

    return this.telemetryUnsub;
  }

  async publishCommand(command: ControlCommand): Promise<void> {
    if (!this.client || !this.currentSettings) {
      throw new Error('MQTT client not connected');
    }
    const topic = commandTopic(this.currentSettings.deviceId);
    // Commands follow { target: 'fan', action: 'on' } so the ESP32 can switch actuators quickly.
    const payload = JSON.stringify({
      target: command.target,
      action: command.action,
      timestamp: new Date().toISOString(),
    });
    return this.publish(topic, payload);
  }

  async publishRules(rules: AutomationRules): Promise<void> {
    if (!this.client || !this.currentSettings) {
      throw new Error('MQTT client not connected');
    }
    const topic = rulesTopic(this.currentSettings.deviceId);
    // Automation payload mirrors ESP32 rule schema for easy persistence on the microcontroller.
    const payload = JSON.stringify({rules, updatedAt: new Date().toISOString()});
    return this.publish(topic, payload);
  }

  private publish(topic: string, payload: string) {
    return new Promise<void>((resolve, reject) => {
      this.client!.publish(topic, payload, {qos: 1, retain: false}, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async testConnection(settings: DeviceSettings): Promise<boolean> {
    try {
      await this.connect(settings);
      await this.disconnect();
      return true;
    } catch (error) {
      console.warn('Connection test failed', error);
      return false;
    }
  }
}

export const mqttClient = new MqttDeviceClient();
