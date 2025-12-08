import React, {useEffect, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {ScreenWrapper} from '@components/ScreenWrapper';
import {RuleSection} from '@components/RuleSection';
import {useAutomationStore} from '@store/useAutomationStore';
import {useDeviceStore} from '@store/useDeviceStore';
import {colors, spacing} from '@theme';
import {getDeviceClient} from '@services/deviceService';
import {AutomationRules} from '@types';

const AutomationScreen = () => {
  const rules = useAutomationStore(state => state.rules);
  const setRules = useAutomationStore(state => state.setRules);
  const loadRules = useAutomationStore(state => state.loadRules);
  const loading = useAutomationStore(state => state.loading);
  const [localRules, setLocalRules] = useState<AutomationRules>(rules);
  const settings = useDeviceStore(state => state.settings);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  useEffect(() => {
    setLocalRules(rules);
  }, [rules]);

  const handleSave = async () => {
    try {
      await setRules(localRules);
      const client = getDeviceClient(settings);
      await client.publishRules(localRules);
      Alert.alert('Automation updated');
    } catch (error) {
      Alert.alert('Failed to save rules', (error as Error)?.message ?? 'Unknown error');
    }
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Automation rules</Text>
      <Text style={styles.subtitle}>Configure thresholds and schedules enforced by the ESP32.</Text>
      {loading && <Text style={styles.loading}>Syncing rules…</Text>}

      <RuleSection
        title="Temperature"
        enabled={localRules.temperature.enabled}
        onToggle={value => setLocalRules(prev => ({...prev, temperature: {...prev.temperature, enabled: value}}))}>
        <View style={styles.inlineInputs}>
          <InputField
            label="Min"
            value={String(localRules.temperature.minTemp)}
            onChangeText={text =>
              setLocalRules(prev => ({...prev, temperature: {...prev.temperature, minTemp: Number(text)}}))
            }
          />
          <InputField
            label="Max"
            value={String(localRules.temperature.maxTemp)}
            onChangeText={text =>
              setLocalRules(prev => ({...prev, temperature: {...prev.temperature, maxTemp: Number(text)}}))
            }
          />
        </View>
      </RuleSection>

      <RuleSection
        title="Humidity"
        enabled={localRules.humidity.enabled}
        onToggle={value => setLocalRules(prev => ({...prev, humidity: {...prev.humidity, enabled: value}}))}>
        <View style={styles.inlineInputs}>
          <InputField
            label="Min"
            value={String(localRules.humidity.minHumidity)}
            onChangeText={text =>
              setLocalRules(prev => ({...prev, humidity: {...prev.humidity, minHumidity: Number(text)}}))
            }
          />
          <InputField
            label="Max"
            value={String(localRules.humidity.maxHumidity)}
            onChangeText={text =>
              setLocalRules(prev => ({...prev, humidity: {...prev.humidity, maxHumidity: Number(text)}}))
            }
          />
        </View>
      </RuleSection>

      <RuleSection 
        title="Water" 
        enabled={localRules.water.autoMode} 
        onToggle={value => setLocalRules(prev => ({...prev, water: {...prev.water, autoMode: value}}))}>
        <View style={styles.inlineInputs}>
          <InputField
            label="Min level %"
            value={String(localRules.water.minLevel)}
            onChangeText={text => setLocalRules(prev => ({...prev, water: {...prev.water, minLevel: Number(text)}}))}
          />
          <InputField
            label="Target %"
            value={String(localRules.water.targetLevel)}
            onChangeText={text => setLocalRules(prev => ({...prev, water: {...prev.water, targetLevel: Number(text)}}))}
          />
        </View>
      </RuleSection>

      <RuleSection
        title="Feed alerts"
        enabled={localRules.feed.autoAlert}
        onToggle={value => setLocalRules(prev => ({...prev, feed: {...prev.feed, autoAlert: value}}))}>
        <InputField
          label="Min level %"
          value={String(localRules.feed.minLevel)}
          onChangeText={text => setLocalRules(prev => ({...prev, feed: {...prev.feed, minLevel: Number(text)}}))}
        />
      </RuleSection>

      <RuleSection
        title="Light schedule"
        enabled={localRules.lightSchedule.enabled}
        onToggle={value => setLocalRules(prev => ({...prev, lightSchedule: {...prev.lightSchedule, enabled: value}}))}>
        <View style={styles.inlineInputs}>
          <InputField
            label="On"
            value={localRules.lightSchedule.onTime}
            onChangeText={text => setLocalRules(prev => ({...prev, lightSchedule: {...prev.lightSchedule, onTime: text}}))}
          />
          <InputField
            label="Off"
            value={localRules.lightSchedule.offTime}
            onChangeText={text => setLocalRules(prev => ({...prev, lightSchedule: {...prev.lightSchedule, offTime: text}}))}
          />
        </View>
      </RuleSection>

      <Pressable style={styles.primaryBtn} onPress={handleSave}>
        <Text style={styles.primaryText}>Save rules</Text>
      </Pressable>
    </ScreenWrapper>
  );
};

const InputField = ({label, value, onChangeText}: {label: string; value: string; onChangeText: (text: string) => void}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput value={value} onChangeText={onChangeText} style={styles.input} keyboardType="decimal-pad" />
  </View>
);

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
  loading: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inlineInputs: {
    flexDirection: 'row',
    columnGap: spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textPrimary,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 14,
    marginTop: spacing.lg,
  },
  primaryText: {
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AutomationScreen;
