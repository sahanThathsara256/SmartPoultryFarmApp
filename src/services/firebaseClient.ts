import {AutomationRules, ControlCommand, DeviceSettings, TelemetryData} from '@types';
import {DeviceApi} from './deviceApi';
import {initializeApp, getApps, FirebaseApp} from 'firebase/app';
import {getDatabase, onValue, ref, set, off, get, Database, DataSnapshot} from 'firebase/database';

// Sanitize device ID to remove invalid Firebase path characters
const sanitizeDeviceId = (deviceId: string): string => {
  // Firebase paths cannot contain: . $ # [ ] /
  return deviceId.replace(/[.#$[\]/]/g, '_');
};

class FirebaseDeviceClient implements DeviceApi {
  private app?: FirebaseApp;
  private db?: Database;
  private telemetryUnsub?: () => void;
  private currentSettings?: DeviceSettings;

  async connect(settings: DeviceSettings): Promise<void> {
    if (!settings.firebase) {
      throw new Error('Firebase config missing');
    }
    const {firebase} = settings;
    if (!firebase.apiKey || !firebase.projectId || !firebase.appId || !firebase.databaseURL) {
      throw new Error('Firebase config incomplete (apiKey, projectId, appId, databaseURL required)');
    }

    this.currentSettings = settings;
    const existing = getApps()[0];
    this.app = existing ?? initializeApp(firebase);
    this.db = getDatabase(this.app, firebase.databaseURL);
  }

  async disconnect(): Promise<void> {
    if (this.telemetryUnsub) {
      this.telemetryUnsub();
      this.telemetryUnsub = undefined;
    }
  }

  subscribeTelemetry(onMessage: (payload: TelemetryData) => void): () => void {
    if (!this.db || !this.currentSettings) {
      throw new Error('Firebase client not connected');
    }
    const deviceId = sanitizeDeviceId(this.currentSettings.deviceId);
    const telemetryRef = ref(this.db, `devices/${deviceId}/telemetry`);
    const unsub = onValue(telemetryRef, (snapshot: DataSnapshot) => {
      const val = snapshot.val() as Partial<TelemetryData> | null;
      if (!val) {
        return;
      }
      onMessage({
        ...(val as TelemetryData),
        timestamp: val.timestamp || new Date().toISOString(),
      });
    });
    this.telemetryUnsub = () => {
      off(telemetryRef);
      unsub();
    };
    return this.telemetryUnsub;
  }

  async publishCommand(command: ControlCommand): Promise<void> {
    if (!this.db || !this.currentSettings) {
      throw new Error('Firebase client not connected');
    }
    const deviceId = sanitizeDeviceId(this.currentSettings.deviceId);
    const cmdRef = ref(this.db, `devices/${deviceId}/commands/${command.target}`);
    await set(cmdRef, {
      action: command.action,
      requestedAt: new Date().toISOString(),
    });
  }

  async publishRules(rules: AutomationRules): Promise<void> {
    if (!this.db || !this.currentSettings) {
      throw new Error('Firebase client not connected');
    }
    const deviceId = sanitizeDeviceId(this.currentSettings.deviceId);
    const rulesRef = ref(this.db, `devices/${deviceId}/rules`);
    await set(rulesRef, {
      ...rules,
      updatedAt: new Date().toISOString(),
    });
  }

  async testConnection(settings: DeviceSettings): Promise<boolean> {
    try {
      await this.connect(settings);
      if (!this.db) {
        return false;
      }

      // Test by reading a simple path instead of .info/connected
      // which can cause issues with some Firebase configurations
      const deviceId = sanitizeDeviceId(settings.deviceId);
      const testRef = ref(this.db, `devices/${deviceId}`);

      // Try to read from the device path - this will succeed even if no data exists
      await get(testRef);
      return true;
    } catch (error) {
      console.warn('Firebase connection test failed', error);
      return false;
    }
  }
}

export const firebaseClient = new FirebaseDeviceClient();


