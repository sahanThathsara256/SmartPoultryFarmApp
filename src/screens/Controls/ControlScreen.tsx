import React, {useCallback} from 'react';
import {Alert, StyleSheet, Text} from 'react-native';
import {ScreenWrapper} from '@components/ScreenWrapper';
import {ControlToggle} from '@components/ControlToggle';
import {useTelemetryStore} from '@store/useTelemetryStore';
import {useDeviceStore} from '@store/useDeviceStore';
import {colors, spacing} from '@theme';
import {ControlTarget, TelemetryData} from '@types';
import {getDeviceClient} from '@services/deviceService';

const ControlScreen = () => {
  const telemetry = useTelemetryStore(state => state.telemetry);
  const commandStates = useTelemetryStore(state => state.commandStates);
  const setCommandState = useTelemetryStore(state => state.setCommandState);
  const mutateTelemetry = useTelemetryStore(state => state.mutateTelemetry);
  const settings = useDeviceStore(state => state.settings);

  const handleToggle = useCallback(
    async (target: ControlTarget, nextState: boolean) => {
      if (!telemetry) {
        Alert.alert('Telemetry missing', 'Cannot control without latest state');
        return;
      }
      const prop = controlPropMap[target];
      const previous = telemetry?.[prop];
      setCommandState(target, 'pending');
      if (prop) {
        mutateTelemetry({[prop]: nextState} as Partial<TelemetryData>);
      }
      const client = getDeviceClient(settings);
      try {
        await client.publishCommand({target, action: nextState ? 'on' : 'off'});
        setCommandState(target, 'idle');
      } catch (error) {
        setCommandState(target, 'error');
        if (prop && typeof previous === 'boolean') {
          mutateTelemetry({[prop]: previous} as Partial<TelemetryData>);
        }
        Alert.alert('Command failed', (error as Error)?.message ?? 'Unknown error');
      }
    },
    [mutateTelemetry, setCommandState, settings, telemetry]
  );

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Manual control</Text>
      <Text style={styles.subtitle}>Override automation when you need precise control.</Text>

      <ControlToggle
        target="light"
        label="Lights"
        isOn={!!telemetry?.lightOn}
        onToggle={handleToggle}
        isBusy={commandStates.light === 'pending'}
      />
      <ControlToggle
        target="fan"
        label="Ventilation fans"
        isOn={!!telemetry?.fanOn}
        onToggle={handleToggle}
        isBusy={commandStates.fan === 'pending'}
      />
      <ControlToggle
        target="heater"
        label="Brooder heater"
        isOn={!!telemetry?.heaterOn}
        onToggle={handleToggle}
        isBusy={commandStates.heater === 'pending'}
      />
      <ControlToggle
        target="pump"
        label="Water pump"
        isOn={!!telemetry?.pumpOn}
        onToggle={handleToggle}
        isBusy={commandStates.pump === 'pending'}
      />
      <ControlToggle
        target="feedMotor"
        label="Feed auger"
        isOn={!!telemetry?.feedMotorOn}
        onToggle={handleToggle}
        isBusy={commandStates.feedMotor === 'pending'}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});

const controlPropMap: Record<ControlTarget, keyof TelemetryData> = {
  light: 'lightOn',
  fan: 'fanOn',
  heater: 'heaterOn',
  pump: 'pumpOn',
  feedMotor: 'feedMotorOn',
  sprayer: 'sprayerOn',
};

export default ControlScreen;
