import Constants from 'expo-constants';
import {DeviceSettings} from '@types';

type ExpoExtra = {
  mockMode?: string;
  mqttBrokerUrl?: string;
  mqttBrokerPort?: number;
  mqttUsername?: string;
  mqttPassword?: string;
  mqttDeviceId?: string;
};

const extra = (Constants.expoConfig?.extra ?? Constants.easConfig?.extra ?? {}) as ExpoExtra;
const toNumber = (value: number | string | undefined, fallback: number) => {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const defaultSettings: DeviceSettings = {
  brokerUrl: extra.mqttBrokerUrl || 'wss://test.mosquitto.org:8081',
  port: toNumber(extra.mqttBrokerPort, 8081),
  username: extra.mqttUsername,
  password: extra.mqttPassword,
  deviceId: extra.mqttDeviceId || 'demo-coop-001',
  mockMode: extra.mockMode === '1' || extra.mockMode === 'true',
};

export const telemetryTopic = (deviceId: string) => `farm/${deviceId}/telemetry`;
export const commandTopic = (deviceId: string) => `farm/${deviceId}/command`;
export const rulesTopic = (deviceId: string) => `farm/${deviceId}/rules`;
