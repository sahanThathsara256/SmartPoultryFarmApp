import 'dotenv/config';
import type {ExpoConfig} from '@expo/config';

const config: ExpoConfig = {
  name: 'Smart Poultry Farm',
  slug: 'smart-poultry-farm',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'smartpoultryfarm',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true,
      },
      NSLocalNetworkUsageDescription: 'This app needs to communicate with the ESP32 device on your local network.',
    },
  },
  extra: {
    mockMode: process.env.MOCK_MODE ?? '0',
    mqttBrokerUrl: process.env.MQTT_BROKER_URL ?? 'wss://test.mosquitto.org:8081',
    mqttBrokerPort: Number(process.env.MQTT_BROKER_PORT ?? 8081),
    mqttUsername: process.env.MQTT_USERNAME ?? '',
    mqttPassword: process.env.MQTT_PASSWORD ?? '',
    mqttDeviceId: process.env.MQTT_DEVICE_ID ?? 'demo-coop-001',
  },
  plugins: ['expo-asset'],
};

export default config;
