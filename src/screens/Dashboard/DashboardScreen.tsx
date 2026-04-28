import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {ScreenWrapper} from '@components/ScreenWrapper';
import {useTelemetryStore} from '@store/useTelemetryStore';
import {spacing, useThemeColors} from '@theme';
import {formatTimestamp} from '@utils/formatters';
import {TemperatureGauge} from '@components/TemperatureGauge';
import {HumidityGauge} from '@components/HumidityGauge';
import {WaterTankLevel} from '@components/WaterTankLevel';
import {FeedContainerLevel} from '@components/FeedContainerLevel';
import {DetailCard} from '@components/DetailCard';

const DashboardScreen = () => {
  const telemetry = useTelemetryStore(state => state.telemetry);
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const tempValue = telemetry ? telemetry.temperature : 0;
  const humidityValue = telemetry ? telemetry.humidity : 0;
  const waterLevel = telemetry ? telemetry.waterLevel : 0;
  const feedLevel = telemetry ? telemetry.feedLevel : 0;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>SmartPoultryFarmApp</Text>
            <Text style={styles.appSubtitle}>Intelligent Farm Management</Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
            {telemetry?.uptime !== undefined ? (
              <Text style={styles.uptimeText}> | UP: {Math.floor(telemetry.uptime / 60)}m</Text>
            ) : null}
          </View>
        </View>

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
              <Text style={styles.statusText}>{tempValue > 30 ? 'High' : tempValue < 20 ? 'Low' : 'Normal'}</Text>
            </View>
          </View>

          <View style={styles.cardContentRow}>
            <TemperatureGauge value={tempValue} />
            <View style={styles.statsColumn}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Range</Text>
                <Text style={styles.statValue}>15-35 C</Text>
              </View>
              <View style={styles.statRow}>
                <View style={[styles.statBox, styles.halfStatBox]}>
                  <Text style={styles.statLabel}>Optimal</Text>
                  <Text style={[styles.statValue, {color: colors.success}]}>20-28 C</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Current</Text>
                  <Text style={[styles.statValue, {color: colors.info}]}>{tempValue.toFixed(1)} C</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, {backgroundColor: colors.accentSecondary}]}>
              <Feather name="droplet" size={24} color={colors.background} />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Humidity</Text>
              <Text style={styles.cardSubtitle}>Moisture Level</Text>
            </View>
            <View style={[styles.statusBadge, styles.successBadge]}>
              <Text style={[styles.statusText, {color: colors.success}]}>Optimal</Text>
            </View>
          </View>

          <View style={styles.cardContentRow}>
            <HumidityGauge value={humidityValue} />
            <View style={styles.statsColumn}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Moisture Level</Text>
                <Text style={[styles.statValue, {color: colors.success}]}>{humidityValue.toFixed(1)}%</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, {width: `${Math.min(humidityValue, 100)}%`}]} />
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={[styles.statBox, styles.halfStatBox]}>
                  <Text style={styles.statLabel}>Target</Text>
                  <Text style={[styles.statValue, {color: colors.success}]}>40-70%</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Status</Text>
                  <Text style={[styles.statValue, {color: colors.success}]}>Optimal</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, {backgroundColor: colors.info}]}>
              <Feather name="layers" size={24} color={colors.textPrimary} />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Water Tank</Text>
              <Text style={styles.cardSubtitle}>500L Capacity</Text>
            </View>
            <View style={[styles.statusBadge, styles.successBadge]}>
              <Text style={[styles.statusText, {color: colors.success}]}>Sufficient</Text>
            </View>
          </View>

          <View style={styles.cardContentRow}>
            <WaterTankLevel value={waterLevel} />
            <View style={styles.statsColumn}>
              <DetailCard label="Daily Usage" value="42L" subLabel="Flow Rate" subValue="2.5 L/min" accentColor={colors.info} />
              <DetailCard label="Estimated Duration" value="8 days" subLabel="Next Refill" subValue="3-4 days" accentColor={colors.accentWarn} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, styles.feedIconContainer]}>
              <Feather name="coffee" size={24} color={colors.textPrimary} />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Feed Container</Text>
              <Text style={styles.cardSubtitle}>50kg Capacity</Text>
            </View>
            <View style={[styles.statusBadge, styles.successBadge]}>
              <Text style={[styles.statusText, {color: colors.success}]}>Available</Text>
            </View>
          </View>

          <View style={styles.cardContentRow}>
            <FeedContainerLevel value={feedLevel || 45} />
            <View style={styles.statsColumn}>
              <DetailCard label="Daily Consumption" value="3.2kg" subLabel="Next Feed" subValue="2 hours" accentColor={colors.accentWarn} />
              <DetailCard label="Duration Left" value="7 days" subLabel="Refill Alert" subValue="@ 15%" accentColor={colors.success} />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>System Controls</Text>
        <View style={styles.controlsGrid}>
          <View style={[styles.controlCard, telemetry?.lightOn ? styles.controlCardActive : null]}>
            <View style={[styles.controlIcon, telemetry?.lightOn ? styles.controlIconActive : null]}>
              <Feather name="sun" size={24} color={telemetry?.lightOn ? colors.background : colors.textSecondary} />
            </View>
            <Text style={[styles.controlLabel, telemetry?.lightOn ? styles.controlLabelActive : null]}>Lights</Text>
            <Text style={styles.controlStatus}>{telemetry?.lightOn ? 'ON' : 'OFF'}</Text>
          </View>

          <View style={[styles.controlCard, telemetry?.autoLightMode ? styles.controlCardActive : null]}>
            <View style={[styles.controlIcon, telemetry?.autoLightMode ? styles.controlIconActive : null]}>
              <Feather name="cpu" size={24} color={telemetry?.autoLightMode ? colors.background : colors.textSecondary} />
            </View>
            <Text style={[styles.controlLabel, telemetry?.autoLightMode ? styles.controlLabelActive : null]}>Auto Mode</Text>
            <Text style={styles.controlStatus}>{telemetry?.autoLightMode ? 'ENABLED' : 'DISABLE'}</Text>
          </View>

          <View style={[styles.controlCard, telemetry?.fanOn ? styles.controlCardActive : null]}>
            <View style={[styles.controlIcon, telemetry?.fanOn ? styles.controlIconActive : null]}>
              <Feather name="wind" size={24} color={telemetry?.fanOn ? colors.background : colors.textSecondary} />
            </View>
            <Text style={[styles.controlLabel, telemetry?.fanOn ? styles.controlLabelActive : null]}>Fans</Text>
            <Text style={styles.controlStatus}>{telemetry?.fanOn ? 'ON' : 'OFF'}</Text>
          </View>

          <View style={[styles.controlCard, telemetry?.heaterOn ? styles.controlCardActive : null]}>
            <View style={[styles.controlIcon, telemetry?.heaterOn ? styles.controlIconActive : null]}>
              <Feather name="thermometer" size={24} color={telemetry?.heaterOn ? colors.background : colors.textSecondary} />
            </View>
            <Text style={[styles.controlLabel, telemetry?.heaterOn ? styles.controlLabelActive : null]}>Heater</Text>
            <Text style={styles.controlStatus}>{telemetry?.heaterOn ? 'ON' : 'OFF'}</Text>
          </View>

          <View style={[styles.controlCard, telemetry?.pumpOn ? styles.controlCardActive : null]}>
            <View style={[styles.controlIcon, telemetry?.pumpOn ? styles.controlIconActive : null]}>
              <Feather name="droplet" size={24} color={telemetry?.pumpOn ? colors.background : colors.textSecondary} />
            </View>
            <Text style={[styles.controlLabel, telemetry?.pumpOn ? styles.controlLabelActive : null]}>Pump</Text>
            <Text style={styles.controlStatus}>{telemetry?.pumpOn ? 'ON' : 'OFF'}</Text>
          </View>
        </View>

        <Text style={styles.timestamp}>
          {telemetry ? `Last Updated: ${formatTimestamp(telemetry.timestamp)}` : 'Waiting for data...'}
        </Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
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
    uptimeText: {
      color: colors.textSecondary,
      fontSize: 12,
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
    feedIconContainer: {
      backgroundColor: colors.accentWarn,
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
    successBadge: {
      borderColor: colors.success,
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
      borderWidth: colors.background === '#F6F8FC' ? 1 : 0,
      borderColor: colors.border,
    },
    halfStatBox: {
      marginRight: spacing.sm,
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
      fontSize: 24,
      fontWeight: '600',
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    bottomSpacer: {
      height: 80,
    },
    controlsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    controlCard: {
      width: '30%',
      backgroundColor: colors.surfacePrimary,
      borderRadius: 16,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    controlCardActive: {
      borderColor: colors.accent,
      backgroundColor: colors.background === '#F6F8FC' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(74, 222, 128, 0.1)',
    },
    controlIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    controlIconActive: {
      backgroundColor: colors.accent,
    },
    controlLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 4,
    },
    controlLabelActive: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    controlStatus: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    timestamp: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });

export default DashboardScreen;
