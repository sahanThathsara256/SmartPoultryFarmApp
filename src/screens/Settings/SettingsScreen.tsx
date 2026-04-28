import React, {useEffect, useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, TextInputProps, View} from 'react-native';
import {ScreenWrapper} from '@components/ScreenWrapper';
import {useDeviceStore} from '@store/useDeviceStore';
import {useThemeStore} from '@store/useThemeStore';
import {getDeviceClient} from '@services/deviceService';
import {spacing, useThemeColors} from '@theme';
import {DeviceSettings} from '@types';

const SettingsScreen = () => {
  const {settings, setSettings, loadSettings, toggleMockMode} = useDeviceStore();
  const themeMode = useThemeStore(state => state.themeMode);
  const toggleThemeMode = useThemeStore(state => state.toggleThemeMode);
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const [form, setForm] = useState<DeviceSettings>(settings);
  const [testing, setTesting] = useState(false);

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

  return (
    <ScreenWrapper scrollable={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your device connection and preferences.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Dark mode</Text>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={() => toggleThemeMode()}
              thumbColor={colors.surfacePrimary}
              trackColor={{false: colors.border, true: colors.accent}}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <Text style={styles.sectionSubtitle}>Connection Mode</Text>
          <View style={styles.transportRow}>
            {(['http', 'firebase', 'mqtt'] as const).map(transport => (
              <Pressable
                key={transport}
                style={[
                  styles.transportOption,
                  form.transport === transport ? styles.transportOptionActive : null,
                ]}
                onPress={() => setForm(prev => ({...prev, transport}))}>
                <Text
                  style={[
                    styles.transportLabel,
                    form.transport === transport ? styles.transportLabelActive : null,
                  ]}>
                  {transport === 'http' ? 'Direct' : transport === 'firebase' ? 'Firebase' : 'MQTT'}
                </Text>
              </Pressable>
            ))}
          </View>

          {form.transport === 'http' ? (
            <>
              <Text style={styles.sectionSubtitle}>ESP32 Direct Connection</Text>
              <Text style={styles.helpText}>
                Connect your phone to SmartFarm_AP WiFi first.{'\n'}
                Password: smartfarm123
              </Text>
              <Input
                styles={styles}
                colors={colors}
                label="ESP32 IP Address"
                autoCapitalize="none"
                value={form.brokerUrl}
                onChangeText={text => setForm(prev => ({...prev, brokerUrl: text}))}
                placeholder="http://192.168.4.1"
              />
            </>
          ) : null}

          {form.transport === 'mqtt' ? (
            <>
              <Text style={styles.sectionSubtitle}>MQTT</Text>
              <Input
                styles={styles}
                colors={colors}
                label="Broker URL"
                autoCapitalize="none"
                value={form.brokerUrl}
                onChangeText={text => setForm(prev => ({...prev, brokerUrl: text}))}
              />
              <Input
                styles={styles}
                colors={colors}
                label="Port"
                keyboardType="numeric"
                value={String(form.port)}
                onChangeText={text => setForm(prev => ({...prev, port: Number(text)}))}
              />
              <Input
                styles={styles}
                colors={colors}
                label="Device ID"
                autoCapitalize="none"
                value={form.deviceId}
                onChangeText={text => setForm(prev => ({...prev, deviceId: text}))}
              />
              <Input
                styles={styles}
                colors={colors}
                label="Username"
                autoCapitalize="none"
                value={form.username ?? ''}
                onChangeText={text => setForm(prev => ({...prev, username: text}))}
              />
              <Input
                styles={styles}
                colors={colors}
                label="Password"
                secureTextEntry
                value={form.password ?? ''}
                onChangeText={text => setForm(prev => ({...prev, password: text}))}
              />
            </>
          ) : null}

          {form.transport === 'firebase' ? (
            <>
              <Text style={styles.sectionSubtitle}>Firebase Realtime DB</Text>
              <Input
                styles={styles}
                colors={colors}
                label="API Key"
                autoCapitalize="none"
                value={form.firebase?.apiKey ?? ''}
                onChangeText={text =>
                  setForm(prev => ({...prev, firebase: {...(prev.firebase || {}), apiKey: text}}))
                }
              />
              <Input
                styles={styles}
                colors={colors}
                label="Project ID"
                autoCapitalize="none"
                value={form.firebase?.projectId ?? ''}
                onChangeText={text =>
                  setForm(prev => ({...prev, firebase: {...(prev.firebase || {}), projectId: text}}))
                }
              />
              <Input
                styles={styles}
                colors={colors}
                label="App ID"
                autoCapitalize="none"
                value={form.firebase?.appId ?? ''}
                onChangeText={text =>
                  setForm(prev => ({...prev, firebase: {...(prev.firebase || {}), appId: text}}))
                }
              />
              <Input
                styles={styles}
                colors={colors}
                label="Database URL"
                autoCapitalize="none"
                value={form.firebase?.databaseURL ?? ''}
                onChangeText={text =>
                  setForm(prev => ({...prev, firebase: {...(prev.firebase || {}), databaseURL: text}}))
                }
              />
              <Input
                styles={styles}
                colors={colors}
                label="Device ID"
                autoCapitalize="none"
                value={form.deviceId}
                onChangeText={text => setForm(prev => ({...prev, deviceId: text}))}
              />
            </>
          ) : null}

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
            <Text style={styles.buttonText}>{testing ? 'Testing...' : 'Test connection'}</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const Input = ({
  label,
  colors,
  styles,
  ...props
}: {
  label: string;
  colors: ReturnType<typeof useThemeColors>;
  styles: ReturnType<typeof makeStyles>;
} & TextInputProps) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} {...props} />
  </View>
);

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
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
