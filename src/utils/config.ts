import Constants from 'expo-constants';
import {DeviceSettings} from '@types';

type ExpoExtra = {
  mockMode?: string;
  mqttBrokerUrl?: string;
  mqttBrokerPort?: number;
  mqttUsername?: string;
  mqttPassword?: string;
  mqttDeviceId?: string;
   transport?: 'mqtt' | 'firebase' | 'http';
   firebaseApiKey?: string;
   firebaseProjectId?: string;
   firebaseAppId?: string;
   firebaseDatabaseURL?: string;
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
  brokerUrl: extra.mqttBrokerUrl || 'http://192.168.4.1',
  port: toNumber(extra.mqttBrokerPort, 8081),
  username: extra.mqttUsername,
  password: extra.mqttPassword,
  deviceId: extra.mqttDeviceId || 'poultry_farm_01',
  mockMode: extra.mockMode === '1' || extra.mockMode === 'true',
  transport: extra.transport || 'http',
  firebase: {
    apiKey: extra.firebaseApiKey || 'AIzaSyBBjiv7n2zK1EUu5EYuGYViYT3YAAJ77C8',
    projectId: extra.firebaseProjectId || 'smartpolutryfarmapp',
    appId: extra.firebaseAppId || '1:836935709786:web:45bc4f0b066f826cc95463',
    databaseURL: extra.firebaseDatabaseURL || 'https://smartpolutryfarmapp-default-rtdb.firebaseio.com',
  },
};

export const telemetryTopic = (deviceId: string) => `farm/${deviceId}/telemetry`;
export const commandTopic = (deviceId: string) => `farm/${deviceId}/command`;
export const rulesTopic = (deviceId: string) => `farm/${deviceId}/rules`;
