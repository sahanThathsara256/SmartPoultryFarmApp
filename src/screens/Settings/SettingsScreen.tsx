import React, {useEffect, useState, useCallback} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, TextInputProps, View} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {ScreenWrapper} from '@components/ScreenWrapper';
import {useDeviceStore} from '@store/useDeviceStore';
import {useAuthStore} from '@store/useAuthStore';
import {getDeviceClient} from '@services/deviceService';
import {colors, spacing} from '@theme';
import {SettingsStackParamList} from '@navigation/types';
import {DeviceSettings} from '@types';

const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const {settings, setSettings, loadSettings, toggleMockMode} = useDeviceStore();
  const logout = useAuthStore(state => state.logout);
  const [form, setForm] = useState<DeviceSettings>(settings);
  const [testing, setTesting] = useState(false);
  const [togglingLed, setTogglingLed] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    await setSettings(form);
    Alert.alert('Settings saved');
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const client = getDeviceClient(form);
      const success = await client.testConnection(form);
      Alert.alert(success ? 'Connection OK' : 'Connection failed');
    } catch (error) {
      Alert.alert('Test failed', (error as Error)?.message ?? 'Unknown error');
    } finally {
      setTesting(false);
    }
  };

  const handleToggleLed = useCallback(async () => {
    try {
      setTogglingLed(true);
      const client = getDeviceClient(settings);
      await client.connect(settings);
      await client.publishCommand({target: 'light', action: 'toggle'});
      Alert.alert('Success', 'LED toggle command sent');
    } catch (error) {
      Alert.alert('Command failed', (error as Error)?.message ?? 'Unknown error');
    } finally {
      setTogglingLed(false);
    }
  }, [settings]);

  return (
    <ScreenWrapper scrollable={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your device connection and preferences.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Connection</Text>

          {/* ── Transport picker ── */}
          <Text style={styles.sectionSubtitle}>Connection Mode</Text>
          <View style={styles.transportRow}>
            {(['http', 'firebase', 'mqtt'] as const).map(t => (
              <Pressable
                key={t}
                style={[
                  styles.transportOption,
                  form.transport === t && styles.transportOptionActive,
                ]}
                onPress={() => setForm(prev => ({...prev, transport: t}))}>
                <Text
                  style={[
                    styles.transportLabel,
                    form.transport === t && styles.transportLabelActive,
                  ]}>
                  {t === 'http' ? '📡 Direct' : t === 'firebase' ? '☁️ Firebase' : '📨 MQTT'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── HTTP (Direct ESP32) settings ── */}
          {form.transport === 'http' && (
            <>
              <Text style={styles.sectionSubtitle}>ESP32 Direct Connection</Text>
              <Text style={styles.helpText}>
                Connect your phone to SmartFarm_AP WiFi first.{'\n'}
                Password: smartfarm123
              </Text>
              <Input
                label="ESP32 IP Address"
                autoCapitalize="none"
                value={form.brokerUrl}
                onChangeText={text => setForm(prev => ({...prev, brokerUrl: text}))}
                placeholder="http://192.168.4.1"
              />
            </>
          )}

          {/* ── MQTT settings ── */}
          {form.transport === 'mqtt' && (
            <>
              <Text style={styles.sectionSubtitle}>MQTT</Text>
          <Input
            label="Broker URL"
            autoCapitalize="none"
            value={form.brokerUrl}
            onChangeText={text => setForm(prev => ({...prev, brokerUrl: text}))}
          />
          <Input
            label="Port"
            keyboardType="numeric"
            value={String(form.port)}
            onChangeText={text => setForm(prev => ({...prev, port: Number(text)}))}
          />
          <Input
            label="Device ID"
            autoCapitalize="none"
            value={form.deviceId}
            onChangeText={text => setForm(prev => ({...prev, deviceId: text}))}
          />
          <Input
            label="Username"
            autoCapitalize="none"
            value={form.username ?? ''}
            onChangeText={text => setForm(prev => ({...prev, username: text}))}
          />
          <Input
            label="Password"
            secureTextEntry
            value={form.password ?? ''}
            onChangeText={text => setForm(prev => ({...prev, password: text}))}
          />
            </>
          )}

          {/* ── Firebase settings ── */}
          {form.transport === 'firebase' && (
            <>
              <Text style={styles.sectionSubtitle}>Firebase Realtime DB</Text>
              <Input
                label="API Key"
                autoCapitalize="none"
                value={form.firebase?.apiKey ?? ''}
                onChangeText={text =>
                  setForm(prev => ({...prev, firebase: {...(prev.firebase || {}), apiKey: text}}))
                }
              />
              <Input
                label="Project ID"
                autoCapitalize="none"
                value={form.firebase?.projectId ?? ''}
                onChangeText={text =>
                  setForm(prev => ({...prev, firebase: {...(prev.firebase || {}), projectId: text}}))
                }
              />
              <Input
                label="App ID"
                autoCapitalize="none"
                value={form.firebase?.appId ?? ''}
                onChangeText={text => setForm(prev => ({...prev, firebase: {...(prev.firebase || {}), appId: text}}))}
              />
              <Input
                label="Database URL"
                autoCapitalize="none"
                value={form.firebase?.databaseURL ?? ''}
                onChangeText={text =>
                  setForm(prev => ({...prev, firebase: {...(prev.firebase || {}), databaseURL: text}}))
                }
              />
              <Input
                label="Device ID"
                autoCapitalize="none"
                value={form.deviceId}
                onChangeText={text => setForm(prev => ({...prev, deviceId: text}))}
              />
            </>
          )}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Mock data mode</Text>
            <Switch
              value={!!form.mockMode}
              onValueChange={value => {
                setForm(prev => ({...prev, mockMode: value}));
                toggleMockMode(value);
              }}
              thumbColor={colors.surfacePrimary}
              trackColor={{false: colors.border, true: colors.accent}}
            />
          </View>
          <Pressable style={[styles.button, styles.secondary]} onPress={handleTest} disabled={testing}>
            <Text style={styles.buttonText}>{testing ? 'Testing…' : 'Test connection'}</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Pressable
            style={[styles.button, styles.ledToggle]}
            onPress={handleToggleLed}
            disabled={togglingLed}>
            <Text style={styles.buttonText}>{togglingLed ? '💡 Toggling...' : '💡 Toggle LED Light'}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable style={[styles.button, styles.secondary]} onPress={() => navigation.navigate('History')}>
            <Text style={styles.buttonText}>View history</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.debug]} onPress={() => navigation.navigate('Debug')}>
            <Text style={styles.buttonText}>🔧 Debug Panel</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.danger]} onPress={logout}>
            <Text style={styles.buttonText}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const Input = ({label, ...props}: {label: string} & TextInputProps) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} {...props} />
  </View>
);

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
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
  button: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 14,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  buttonText: {
    color: '#03120d',
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: colors.surfacePrimary,
  },
  debug: {
    backgroundColor: colors.info,
  },
  danger: {
    backgroundColor: colors.accentError,
  },
  ledToggle: {
    backgroundColor: colors.accentWarn,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  switchLabel: {
    color: colors.textPrimary,
  },
  transportRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  transportOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfacePrimary,
    alignItems: 'center',
  },
  transportOptionActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  transportLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  transportLabelActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: 13,
    backgroundColor: colors.surfacePrimary,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});

export default SettingsScreen;
