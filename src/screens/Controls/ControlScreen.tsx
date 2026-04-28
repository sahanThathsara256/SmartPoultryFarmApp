import React, {useCallback} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {ScreenWrapper} from '@components/ScreenWrapper';
import {ControlToggle} from '@components/ControlToggle';
import {useTelemetryStore} from '@store/useTelemetryStore';
import {useDeviceStore} from '@store/useDeviceStore';
import {useAutomationStore} from '@store/useAutomationStore';
import {spacing, useThemeColors} from '@theme';
import {ControlTarget, TelemetryData} from '@types';
import {getDeviceClient} from '@services/deviceService';

const ControlScreen = () => {
  const telemetry = useTelemetryStore(state => state.telemetry);
  const commandStates = useTelemetryStore(state => state.commandStates);
  const setCommandState = useTelemetryStore(state => state.setCommandState);
  const mutateTelemetry = useTelemetryStore(state => state.mutateTelemetry);
  const settings = useDeviceStore(state => state.settings);
  const rules = useAutomationStore(state => state.rules);
  const setAutoMode = useAutomationStore(state => state.setAutoMode);
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const [modeBusy, setModeBusy] = React.useState(false);

  const autoModeEnabled =
    rules.temperature.enabled ||
    rules.humidity.enabled ||
    rules.water.autoMode ||
    rules.feed.autoAlert ||
    rules.lightSchedule.enabled ||
    telemetry?.autoLightMode === true ||
    telemetry?.autoTempMode === true ||
    telemetry?.autoWaterPumpMode === true;

  const disabledReason = 'Auto mode is on. Switch to Manual mode to use this control.';

  const handleToggle = useCallback(
    async (target: ControlTarget, nextState: boolean) => {
      if (autoModeEnabled) {
        Alert.alert('Auto mode is on', 'Turn off Auto mode to use manual controls.');
        return;
      }
      if (!telemetry) {
        Alert.alert('Telemetry missing', 'Cannot control without latest state');
        return;
      }
      const prop = controlPropMap[target];
      const previous = telemetry[prop];
      setCommandState(target, 'pending');
      mutateTelemetry({[prop]: nextState} as Partial<TelemetryData>);
      const client = getDeviceClient(settings);
      try {
        await client.publishCommand({target, action: nextState ? 'on' : 'off'});
        setCommandState(target, 'idle');
      } catch (error) {
        setCommandState(target, 'error');
        if (typeof previous === 'boolean') {
          mutateTelemetry({[prop]: previous} as Partial<TelemetryData>);
        }
        Alert.alert('Command failed', (error as Error)?.message ?? 'Unknown error');
      }
    },
    [autoModeEnabled, mutateTelemetry, setCommandState, settings, telemetry],
  );

  const handleModeToggle = useCallback(async () => {
    const nextAutoMode = !autoModeEnabled;
    setModeBusy(true);
    try {
      const nextRules = await setAutoMode(nextAutoMode);
      const client = getDeviceClient(settings);
      await client.publishRules(nextRules);
      mutateTelemetry({
        autoLightMode: nextAutoMode,
        autoTempMode: nextAutoMode,
        autoWaterPumpMode: nextAutoMode,
      });
    } catch (error) {
      await setAutoMode(autoModeEnabled);
      Alert.alert('Mode change failed', (error as Error)?.message ?? 'Unknown error');
    } finally {
      setModeBusy(false);
    }
  }, [autoModeEnabled, mutateTelemetry, setAutoMode, settings]);

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Manual control</Text>
      <Text style={styles.subtitle}>Switch to Manual mode before controlling farm devices directly.</Text>

      <View style={[styles.modeCard, autoModeEnabled ? styles.modeCardAuto : styles.modeCardManual]}>
        <View style={styles.modeTextWrap}>
          <Text style={styles.modeLabel}>{autoModeEnabled ? 'Auto mode' : 'Manual mode'}</Text>
          <Text style={styles.modeHelper}>
            {autoModeEnabled ? 'Manual controls are disabled.' : 'Manual controls are available.'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          style={[styles.modeButton, modeBusy ? styles.modeButtonDisabled : null]}
          onPress={handleModeToggle}
          disabled={modeBusy}>
          <Text style={styles.modeButtonText}>
            {modeBusy ? 'Syncing...' : autoModeEnabled ? 'Manual Mode' : 'Auto Mode'}
          </Text>
        </Pressable>
      </View>

      <ControlToggle
        target="light"
        label="Lights"
        isOn={!!telemetry?.lightOn}
        onToggle={handleToggle}
        isBusy={commandStates.light === 'pending'}
        disabled={autoModeEnabled}
        disabledReason={disabledReason}
      />
      <ControlToggle
        target="fan"
        label="Ventilation fans"
        isOn={!!telemetry?.fanOn}
        onToggle={handleToggle}
        isBusy={commandStates.fan === 'pending'}
        disabled={autoModeEnabled}
        disabledReason={disabledReason}
      />
      <ControlToggle
        target="heater"
        label="Brooder heater"
        isOn={!!telemetry?.heaterOn}
        onToggle={handleToggle}
        isBusy={commandStates.heater === 'pending'}
        disabled={autoModeEnabled}
        disabledReason={disabledReason}
      />
      <ControlToggle
        target="pump"
        label="Water pump"
        isOn={!!telemetry?.pumpOn}
        onToggle={handleToggle}
        isBusy={commandStates.pump === 'pending'}
        disabled={autoModeEnabled}
        disabledReason={disabledReason}
      />
    </ScreenWrapper>
  );
};

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    modeCard: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      columnGap: spacing.md,
    },
    modeCardAuto: {
      borderColor: colors.accent,
      backgroundColor: colors.background === '#F6F8FC' ? 'rgba(22, 163, 74, 0.08)' : colors.surfaceSecondary,
    },
    modeCardManual: {
      borderColor: colors.border,
    },
    modeTextWrap: {
      flex: 1,
    },
    modeLabel: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    modeHelper: {
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    modeButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minWidth: 112,
    },
    modeButtonDisabled: {
      opacity: 0.6,
    },
    modeButtonText: {
      color: colors.background,
      fontWeight: '700',
      textAlign: 'center',
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
