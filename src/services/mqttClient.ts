import {connect, IClientOptions, ISubscriptionGrant, MqttClient as RawClient} from 'mqtt';
import {Buffer} from 'buffer';
import {AutomationRules, ControlCommand, DeviceSettings, TelemetryData} from '@types';
import {commandTopic, rulesTopic, telemetryTopic} from '@utils/config';
import {DeviceApi} from './deviceApi';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';

type TelemetrySubscription = {
  topic: string;
  listener: (incomingTopic: string, message: Buffer) => void;
};

export class MqttDeviceClient implements DeviceApi {
  private client?: RawClient;
  private currentSettings?: DeviceSettings;
  private connectionState: ConnectionState = 'disconnected';
  private connectPromise?: Promise<void>;
  private disconnectPromise?: Promise<void>;
  private telemetrySubscriptions = new Set<TelemetrySubscription>();
  private activeTelemetryTopics = new Set<string>();

  async connect(settings: DeviceSettings): Promise<void> {
    if (this.disconnectPromise) {
      await this.disconnectPromise;
    }

    if (this.client?.connected && this.currentSettings?.deviceId === settings.deviceId) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    if (this.client?.connected && this.currentSettings?.deviceId !== settings.deviceId) {
      await this.disconnect();
    }

    this.currentSettings = settings;
    this.connectionState = 'connecting';

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const client = connect(settings.brokerUrl, this.createClientOptions(settings));
      this.client = client;

      const cleanup = () => {
        client.removeListener('connect', handleConnect);
        client.removeListener('error', handleError);
      };

      const handleConnect = () => {
        cleanup();
        this.connectionState = 'connected';
        resolve();
      };

      const handleError = (error: Error) => {
        cleanup();
        this.connectionState = 'error';
        this.cleanupTelemetrySubscriptions();
        client.end(true);
        if (this.client === client) {
          this.client = undefined;
        }
        reject(error);
      };

      client.once('connect', handleConnect);
      client.once('error', handleError);
    });

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = undefined;
    }
  }

  async disconnect(): Promise<void> {
    if (this.disconnectPromise) {
      return this.disconnectPromise;
    }

    const client = this.client;
    if (!client) {
      this.cleanupTelemetrySubscriptions();
      this.currentSettings = undefined;
      this.connectionState = 'disconnected';
      return;
    }

    this.connectionState = 'disconnecting';
    this.cleanupTelemetrySubscriptions();

    this.disconnectPromise = new Promise(resolve => {
      client.end(true, {}, () => {
        if (this.client === client) {
          this.client = undefined;
        }
        this.currentSettings = undefined;
        this.connectionState = 'disconnected';
        resolve();
      });
    });

    try {
      await this.disconnectPromise;
    } finally {
      this.disconnectPromise = undefined;
    }
  }

  subscribeTelemetry(onMessage: (payload: TelemetryData) => void): () => void {
    const client = this.requireConnectedClient();
    const settings = this.requireCurrentSettings();

    const topic = telemetryTopic(settings.deviceId);
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

    const subscription: TelemetrySubscription = {topic, listener};

    if (!this.activeTelemetryTopics.has(topic)) {
      client.subscribe(topic, {qos: 1}, (err: Error | null, granted?: ISubscriptionGrant[]) => {
        if (err) {
          console.warn('Failed to subscribe telemetry', err);
          return;
        }
        const hasQosOneGrant = (granted ?? []).some(grant => grant.qos >= 1);
        if (!hasQosOneGrant) {
          console.warn('Telemetry subscription granted with lower QoS than requested', granted);
        }
      });
      this.activeTelemetryTopics.add(topic);
    }

    client.on('message', listener);
    this.telemetrySubscriptions.add(subscription);

    return () => {
      if (!this.telemetrySubscriptions.delete(subscription)) {
        return;
      }

      const activeClient = this.client;
      activeClient?.off('message', listener);

      const hasOtherListenersForTopic = Array.from(this.telemetrySubscriptions).some(
        current => current.topic === topic,
      );
      if (!hasOtherListenersForTopic && this.activeTelemetryTopics.has(topic)) {
        activeClient?.unsubscribe(topic);
        this.activeTelemetryTopics.delete(topic);
      }
    };
  }

  async publishCommand(command: ControlCommand): Promise<void> {
    const settings = this.requireCurrentSettings();
    const topic = commandTopic(settings.deviceId);
    // Commands follow { target: 'fan', action: 'on' } so the ESP32 can switch actuators quickly.
    const payload = JSON.stringify({
      target: command.target,
      action: command.action,
      timestamp: new Date().toISOString(),
    });
    return this.publish(topic, payload);
  }

  async publishRules(rules: AutomationRules): Promise<void> {
    const settings = this.requireCurrentSettings();
    const topic = rulesTopic(settings.deviceId);
    // Automation payload mirrors ESP32 rule schema for easy persistence on the microcontroller.
    const payload = JSON.stringify({rules, updatedAt: new Date().toISOString()});
    return this.publish(topic, payload);
  }

  private publish(topic: string, payload: string) {
    const client = this.requireConnectedClient();

    return new Promise<void>((resolve, reject) => {
      client.publish(topic, payload, {qos: 1, retain: false}, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async testConnection(settings: DeviceSettings): Promise<boolean> {
    const testClient = connect(settings.brokerUrl, this.createClientOptions(settings));

    try {
      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          testClient.removeListener('connect', handleConnect);
          testClient.removeListener('error', handleError);
        };

        const handleConnect = () => {
          cleanup();
          resolve();
        };

        const handleError = (error: Error) => {
          cleanup();
          reject(error);
        };

        testClient.once('connect', handleConnect);
        testClient.once('error', handleError);
      });

      await new Promise<void>(resolve => {
        testClient.end(true, {}, () => resolve());
      });

      return true;
    } catch (error) {
      console.warn('Connection test failed', error);
      testClient.end(true);
      return false;
    }
  }

  private createClientOptions(settings: DeviceSettings): IClientOptions {
    return {
      username: settings.username,
      password: settings.password,
      reconnectPeriod: 3000,
      connectTimeout: 10_000,
      protocol: settings.brokerUrl.startsWith('wss') ? 'wss' : 'ws',
      port: settings.port,
    };
  }

  private requireConnectedClient(): RawClient {
    if (!this.client || !this.client.connected || this.connectionState !== 'connected') {
      throw new Error(`MQTT client is not connected (state: ${this.connectionState})`);
    }

    return this.client;
  }

  private requireCurrentSettings(): DeviceSettings {
    if (!this.currentSettings) {
      throw new Error('MQTT client settings are not available');
    }

    return this.currentSettings;
  }

  private cleanupTelemetrySubscriptions(): void {
    const activeClient = this.client;
    this.telemetrySubscriptions.forEach(({topic, listener}) => {
      activeClient?.off('message', listener);
      if (this.activeTelemetryTopics.has(topic)) {
        activeClient?.unsubscribe(topic);
      }
    });

    this.telemetrySubscriptions.clear();
    this.activeTelemetryTopics.clear();
  }
}

export const mqttClient = new MqttDeviceClient();
