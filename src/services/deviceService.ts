import {DeviceSettings} from '@types';
import {DeviceApi} from './deviceApi';
import {mockDeviceApi} from './mockApi';
import {mqttClient} from './mqttClient';
import {firebaseClient} from './firebaseClient';
import {httpDeviceApi} from './httpDeviceApi';

export const getDeviceClient = (settings: DeviceSettings): DeviceApi => {
  if (settings.mockMode) {
    return mockDeviceApi;
  }
  if (settings.transport === 'firebase') {
    return firebaseClient;
  }
  if (settings.transport === 'http') {
    return httpDeviceApi;
  }
  return mqttClient;
};
