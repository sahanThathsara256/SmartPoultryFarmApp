import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '@components/ScreenWrapper';
import { useTelemetryStore } from '@store/useTelemetryStore';
import { useDeviceStore } from '@store/useDeviceStore';
import { colors, spacing } from '@theme';
import { formatTimestamp } from '@utils/formatters';
import { TemperatureGauge } from '@components/TemperatureGauge';
import { HumidityGauge } from '@components/HumidityGauge';
import { WaterTankLevel } from '@components/WaterTankLevel';
import { Feather } from '@expo/vector-icons';

const DashboardScreen = () => {
  const telemetry = useTelemetryStore(state => state.telemetry);
  const deviceStatus = useDeviceStore(state => state.status);

  // Mock data if telemetry is null for visualization
  const tempValue = telemetry ? telemetry.temperature : 0;
  const humidityValue = telemetry ? telemetry.humidity : 0;
  const waterLevel = telemetry ? telemetry.waterLevel : 0;
  const feedLevel = telemetry ? telemetry.feedLevel : 0;

  const renderStatusChip = (label: string, isOn?: boolean) => (
    <View style={[styles.chip, isOn ? styles.chipOn : styles.chipOff]} key={label}>
      <Text style={styles.chipText}>
        {label}: {isOn ? 'ON' : 'OFF'}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>AgriTech Pro</Text>
            <Text style={styles.appSubtitle}>Intelligent Farm Management</Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        {/* Temperature Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Feather name="thermometer" size={24} color={colors.textPrimary} />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Temperature</Text>
              <Text style={styles.cardSubtitle}>Environmental Control</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {tempValue > 30 ? 'High' : tempValue < 20 ? 'Low' : 'Normal'}
              </Text>
            </View>
          </View>

          <View style={styles.cardContentRow}>
            <TemperatureGauge value={tempValue} />
            <View style={styles.statsColumn}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Range</Text>
                <Text style={styles.statValue}>15-35°C</Text>
              </View>
              <View style={styles.statRow}>
                <View style={[styles.statBox, { marginRight: spacing.sm }]}>
                  <Text style={styles.statLabel}>Optimal</Text>
                  <Text style={[styles.statValue, { color: colors.success }]}>20-28°C</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Current</Text>
                  <Text style={[styles.statValue, { color: colors.info }]}>{tempValue.toFixed(1)}°C</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Humidity Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accentSecondary }]}>
              <Feather name="droplet" size={24} color={colors.background} />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Humidity</Text>
              <Text style={styles.cardSubtitle}>Moisture Level</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: colors.success }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>Optimal</Text>
            </View>
          </View>

          <View style={styles.cardContentRow}>
            <HumidityGauge value={humidityValue} />
            <View style={styles.statsColumn}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Moisture Level</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>{humidityValue.toFixed(1)}%</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(humidityValue, 100)}%` }]} />
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={[styles.statBox, { marginRight: spacing.sm }]}>
                  <Text style={styles.statLabel}>Target</Text>
                  <Text style={[styles.statValue, { color: colors.success }]}>40-70%</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Status</Text>
                  <Text style={[styles.statValue, { color: colors.success }]}>Optimal</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Water Tank Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.info }]}>
              <Feather name="layers" size={24} color={colors.textPrimary} />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Water Tank</Text>
              <Text style={styles.cardSubtitle}>500L Capacity</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: colors.success }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>Sufficient</Text>
            </View>
          </View>

          <View style={styles.cardContentRow}>
            <WaterTankLevel value={waterLevel} />
            <View style={styles.statsColumn}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Daily Usage</Text>
                <Text style={styles.statValue}>45L</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Refill Status</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>Auto-fill Ready</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actuators Section */}
        <Text style={styles.sectionTitle}>System Controls</Text>
        <View style={styles.chipRow}>
          {renderStatusChip('Lights', telemetry?.lightOn)}
          {renderStatusChip('Fans', telemetry?.fanOn)}
          {renderStatusChip('Heater', telemetry?.heaterOn)}
          {renderStatusChip('Pump', telemetry?.pumpOn)}
          {renderStatusChip('Feed Motor', telemetry?.feedMotorOn)}
        </View>

        <Text style={styles.timestamp}>
          {telemetry ? `Last Updated: ${formatTimestamp(telemetry.timestamp)}` : 'Waiting for data...'}
        </Text>

        <View style={{ height: 80 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  appName: {
    color: colors.info,
    fontSize: 18,
    fontWeight: '600',
  },
  appSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  liveText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statsColumn: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  statBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: 4,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 8,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accentSecondary,
    borderRadius: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.md,
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
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default DashboardScreen;
