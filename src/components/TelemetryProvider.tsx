import React, {ReactNode, useEffect} from 'react';
import {useTelemetryBridge} from '@hooks/useTelemetryBridge';
import {useDeviceStore} from '@store/useDeviceStore';

export const TelemetryProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const loadSettings = useDeviceStore(state => state.loadSettings);
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  useTelemetryBridge();
  return <>{children}</>;
};
