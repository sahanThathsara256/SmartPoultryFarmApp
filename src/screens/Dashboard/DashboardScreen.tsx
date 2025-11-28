import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ScreenWrapper} from '@components/ScreenWrapper';
import {TelemetryCard} from '@components/TelemetryCard';
import {useTelemetryStore} from '@store/useTelemetryStore';
import {useDeviceStore} from '@store/useDeviceStore';
import {colors, spacing} from '@theme';
import {formatTimestamp, formatPercent} from '@utils/formatters';

const DashboardScreen = () => {
  const telemetry = useTelemetryStore(state => state.telemetry);
  const deviceStatus = useDeviceStore(state => state.status);

  const renderStatusChip = (label: string, isOn?: boolean) => (
    <View style={[styles.chip, isOn ? styles.chipOn : styles.chipOff]} key={label}>
      <Text style={styles.chipText}>
        {label}: {isOn ? 'ON' : 'OFF'}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live dashboard</Text>
          <Text style={styles.subtitle}>Status: {deviceStatus}</Text>
        </View>
        <Text style={styles.timestamp}>
          {telemetry ? `Updated ${formatTimestamp(telemetry.timestamp)}` : 'Waiting for telemetry…'}
        </Text>
      </View>

      <View style={styles.grid}>
        <TelemetryCard label="Temperature" value={telemetry ? telemetry.temperature.toFixed(1) : '--'} unit="°C" />
        <TelemetryCard label="Humidity" value={telemetry ? telemetry.humidity.toFixed(1) : '--'} unit="%" />
        <TelemetryCard
          label="Water level"
          value={telemetry ? formatPercent(telemetry.waterLevel) : '--'}
          footer="Tank"
          status={telemetry && telemetry.waterLevel < 25 ? 'warn' : 'ok'}
        />
        <TelemetryCard
          label="Feed level"
          value={telemetry ? formatPercent(telemetry.feedLevel) : '--'}
          footer="Hopper"
          status={telemetry && telemetry.feedLevel < 20 ? 'warn' : 'ok'}
        />
      </View>

      <Text style={styles.sectionTitle}>Actuators</Text>
      <View style={styles.chipRow}>
        {renderStatusChip('Lights', telemetry?.lightOn)}
        {renderStatusChip('Fans', telemetry?.fanOn)}
        {renderStatusChip('Heater', telemetry?.heaterOn)}
        {renderStatusChip('Pump', telemetry?.pumpOn)}
        {renderStatusChip('Feed motor', telemetry?.feedMotorOn)}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginVertical: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipOn: {
    backgroundColor: colors.accent,
  },
  chipOff: {
    backgroundColor: colors.surfaceSecondary,
  },
  chipText: {
    color: colors.textPrimary,
  },
});

export default DashboardScreen;
