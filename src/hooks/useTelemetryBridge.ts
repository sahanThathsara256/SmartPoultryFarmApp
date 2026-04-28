import {useCallback, useEffect} from 'react';
import {getDeviceClient} from '@services/deviceService';
import {useDeviceStore} from '@store/useDeviceStore';
import {useTelemetryStore} from '@store/useTelemetryStore';
import {useEventsStore} from '@store/useEventsStore';
import {useAutomationStore} from '@store/useAutomationStore';

export const useTelemetryBridge = () => {
  const settings = useDeviceStore(state => state.settings);
  const setStatus = useDeviceStore(state => state.setStatus);
  const hydrated = useDeviceStore(state => state.hydrated);
  const updateTelemetry = useTelemetryStore(state => state.updateTelemetry);
  const addNotification = useEventsStore(state => state.addNotification);
  const rules = useAutomationStore(state => state.rules);

  const handleTelemetry = useCallback((payload: any) => {
    // Process alerts from firmware
    if (payload.alerts && Array.isArray(payload.alerts)) {
      payload.alerts.forEach((msg: string) => {
        addNotification({
          id: Math.random().toString(36).substr(2, 9),
          title: 'Farm Alert',
          message: msg,
          type: 'info',
          timestamp: new Date().toISOString(),
        });
      });
    }

    // Sync local rules if changed on hardware (optional but good for consistency)
    if (payload.autoWaterPumpMode !== undefined && payload.autoWaterPumpMode !== rules.water.autoMode) {
      // Just an example, maybe we don't want to sync back automatically to avoid loops
      // console.log('Syncing rules from hardware');
    }

    updateTelemetry(payload);
  }, [addNotification, rules.water.autoMode, updateTelemetry]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    let unsubscribe: (() => void) | undefined;
    let active = true;

    const bootstrap = async () => {
      try {
        setStatus('connecting');
        const client = getDeviceClient(settings);
        await client.connect(settings);
        if (!active) {
          return;
        }
        unsubscribe = client.subscribeTelemetry(handleTelemetry);
        setStatus('connected');
      } catch (error) {
        console.warn('Telemetry bridge failed', error);
        setStatus('error', (error as Error)?.message);
      }
    };

    bootstrap();

    return () => {
      active = false;
      unsubscribe?.();
      getDeviceClient(settings)
        .disconnect()
        .catch(err => console.warn('Disconnect failed', err));
    };
  }, [settings, setStatus, hydrated, handleTelemetry]);
};
