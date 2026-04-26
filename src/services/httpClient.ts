import {ControlCommand, TelemetryData} from '@types';

const DEFAULT_ESP32_IP = 'http://192.168.4.1';
const REQUEST_TIMEOUT = 5000;

export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
}

class HttpDeviceClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config?: HttpClientConfig) {
    this.baseUrl = config?.baseUrl || DEFAULT_ESP32_IP;
    this.timeout = config?.timeout || REQUEST_TIMEOUT;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  private async fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Send a command to a specific target device
   * Endpoint: POST /command
   * Body: { "target": "light", "action": "toggle" }
   */
  async sendCommand(command: ControlCommand): Promise<{success: boolean; message?: string}> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: command.target,
          action: command.action,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {success: true, message: data.message || 'Command sent successfully'};
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request timeout - ESP32 not responding');
      }
      throw error;
    }
  }

  /**
   * Quick command helpers for each target
   */
  async toggleLight(): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'light', action: 'toggle'});
  }

  async setLight(on: boolean): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'light', action: on ? 'on' : 'off'});
  }

  async toggleFan(): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'fan', action: 'toggle'});
  }

  async setFan(on: boolean): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'fan', action: on ? 'on' : 'off'});
  }

  async toggleHeater(): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'heater', action: 'toggle'});
  }

  async setHeater(on: boolean): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'heater', action: on ? 'on' : 'off'});
  }

  async togglePump(): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'pump', action: 'toggle'});
  }

  async setPump(on: boolean): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'pump', action: on ? 'on' : 'off'});
  }

  async toggleFeedMotor(): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'feedMotor', action: 'toggle'});
  }

  async setFeedMotor(on: boolean): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'feedMotor', action: on ? 'on' : 'off'});
  }

  async toggleSprayer(): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'sprayer', action: 'toggle'});
  }

  async setSprayer(on: boolean): Promise<{success: boolean; message?: string}> {
    return this.sendCommand({target: 'sprayer', action: on ? 'on' : 'off'});
  }

  /**
   * Get current telemetry data from ESP32
   * Endpoint: GET /telemetry
   */
  async getTelemetry(): Promise<TelemetryData> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/telemetry`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request timeout - ESP32 not responding');
      }
      throw error;
    }
  }

  /**
   * Test connection to ESP32
   * Endpoint: GET /status or /
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/status`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      // Try root endpoint as fallback
      try {
        const response = await this.fetchWithTimeout(this.baseUrl, {
          method: 'GET',
        });
        return response.ok;
      } catch {
        return false;
      }
    }
  }
}

// Export singleton instance with default config
export const httpClient = new HttpDeviceClient();

// Export class for custom instances
export {HttpDeviceClient};
