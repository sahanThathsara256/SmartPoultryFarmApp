import React, {useEffect, useState} from 'react';
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
          <Text style={styles.sectionTitle}>MQTT connection</Text>
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
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Mock data mode</Text>
            <Switch
              value={!!form.mockMode}
              onValueChange={value => {
                setForm(prev => ({...prev, mockMode: value}));
                toggleMockMode(value);
              }}
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
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable style={[styles.button, styles.secondary]} onPress={() => navigation.navigate('History')}>
            <Text style={styles.buttonText}>View history</Text>
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
  danger: {
    backgroundColor: colors.accentError,
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
});

export default SettingsScreen;
