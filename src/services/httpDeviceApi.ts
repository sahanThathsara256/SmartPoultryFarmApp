/**
 * HTTP Device API — talks directly to the ESP32 local HTTP server.
 *
 * The phone must be connected to the ESP32 Access-Point WiFi
 * (default SSID: SmartFarm_AP, password: smartfarm123).
 *
 * ESP32 API endpoints:
 *   GET  /api/telemetry   → sensor data + device states
 *   POST /api/command      → { target, action }
 *   POST /api/autolight    → { enabled }
 */

import {AutomationRules, ControlCommand, DeviceSettings, TelemetryData} from '@types';
import {DeviceApi} from './deviceApi';

const DEFAULT_ESP32_URL = 'http://192.168.4.1';
const POLL_INTERVAL_MS = 2000;
const FETCH_TIMEOUT_MS = 5000;

class HttpDeviceApi implements DeviceApi {
  private baseUrl = DEFAULT_ESP32_URL;
  private pollTimer?: ReturnType<typeof setInterval>;

  /* ── DeviceApi interface ──────────────────────────────── */

  async connect(settings: DeviceSettings): Promise<void> {
    // When transport is 'http' the brokerUrl field stores the ESP32 IP.
    const raw = settings.brokerUrl || DEFAULT_ESP32_URL;
    this.baseUrl = raw.startsWith('http') ? raw : `http://${raw}`;
  }

  async disconnect(): Promise<void> {
    this.stopPolling();
  }

  subscribeTelemetry(onMessage: (payload: TelemetryData) => void): () => void {
    const fetchOnce = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const response = await fetch(`${this.baseUrl}/api/telemetry`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          onMessage({
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
          });
        }
      } catch (error) {
        // Swallow — next poll will retry
        console.warn('[httpDeviceApi] telemetry fetch failed', error);
      }
    };

    // First fetch right away, then keep polling
    fetchOnce();
    this.pollTimer = setInterval(fetchOnce, POLL_INTERVAL_MS);

    return () => this.stopPolling();
  }

  async publishCommand(command: ControlCommand): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/api/command`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({target: command.target, action: command.action}),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      clearTimeout(timeout);
      if ((error as Error).name === 'AbortError') {
        throw new Error('ESP32 not responding — make sure you are on SmartFarm_AP WiFi');
      }
      throw error;
    }
  }

  async publishRules(rules: AutomationRules): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/api/autolight`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({enabled: rules.lightSchedule.enabled}),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      clearTimeout(timeout);
      console.warn('[httpDeviceApi] failed to sync autolight', error);
      throw error;
    }
  }

  async testConnection(settings: DeviceSettings): Promise<boolean> {
    try {
      const url = settings.brokerUrl || DEFAULT_ESP32_URL;
      const base = url.startsWith('http') ? url : `http://${url}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const response = await fetch(`${base}/api/telemetry`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }

  /* ── helpers ──────────────────────────────────────────── */

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }
}

export const httpDeviceApi = new HttpDeviceApi();
