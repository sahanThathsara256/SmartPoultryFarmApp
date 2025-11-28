import {DeviceSettings} from '@types';
import {DeviceApi} from './deviceApi';
import {mockDeviceApi} from './mockApi';
import {mqttClient} from './mqttClient';

export const getDeviceClient = (settings: DeviceSettings): DeviceApi => {
  if (settings.mockMode) {
    return mockDeviceApi;
  }
  return mqttClient;
};
