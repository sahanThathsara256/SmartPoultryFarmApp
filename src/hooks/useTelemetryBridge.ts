import {useEffect} from 'react';
import {getDeviceClient} from '@services/deviceService';
import {useDeviceStore} from '@store/useDeviceStore';
import {useTelemetryStore} from '@store/useTelemetryStore';

export const useTelemetryBridge = () => {
  const settings = useDeviceStore(state => state.settings);
  const setStatus = useDeviceStore(state => state.setStatus);
  const hydrated = useDeviceStore(state => state.hydrated);
  const updateTelemetry = useTelemetryStore(state => state.updateTelemetry);

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
        unsubscribe = client.subscribeTelemetry(updateTelemetry);
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
  }, [settings, setStatus, updateTelemetry, hydrated]);
};
