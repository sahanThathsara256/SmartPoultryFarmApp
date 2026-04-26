import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { ScreenWrapper } from '@components/ScreenWrapper';
import { useTelemetryStore } from '@store/useTelemetryStore';
import { useDeviceStore } from '@store/useDeviceStore';
import { getDeviceClient } from '@services/deviceService';
import { httpClient } from '@services/httpClient';
import { colors, spacing } from '@theme';
import { Feather } from '@expo/vector-icons';
import { ControlTarget } from '@types';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface SensorReading {
  name: string;
  value: string | number;
  unit: string;
  status: 'ok' | 'warning' | 'error' | 'unknown';
  icon: string;
  pin?: string;
}

interface ActuatorState {
  name: string;
  target: ControlTarget;
  isOn: boolean;
  icon: string;
  pin?: string;
}

const DebugScreen = () => {
  const telemetry = useTelemetryStore(state => state.telemetry);
  const settings = useDeviceStore(state => state.settings);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [refreshing, setRefreshing] = useState(false);
  const [testingActuator, setTestingActuator] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [togglingLed, setTogglingLed] = useState(false);
  const [esp32Ip, setEsp32Ip] = useState('http://192.168.4.1');
  const [httpLoading, setHttpLoading] = useState<string | null>(null);

  // Update last received time when telemetry changes
  useEffect(() => {
    if (telemetry) {
      setLastUpdate(new Date());
      setConnectionStatus('connected');
    }
  }, [telemetry]);

  const getSensorStatus = (value: number | undefined, min: number, max: number): 'ok' | 'warning' | 'error' | 'unknown' => {
    if (value === undefined || value === null) {return 'unknown';}
    if (value < min || value > max) {return 'error';}
    return 'ok';
  };

  const sensors: SensorReading[] = [
    {
      name: 'Temperature',
      value: telemetry?.temperature?.toFixed(1) ?? '--',
      unit: '°C',
      status: getSensorStatus(telemetry?.temperature, 0, 50),
      icon: 'thermometer',
      pin: 'GPIO 46 (DHT22)',
    },
    {
      name: 'Humidity',
      value: telemetry?.humidity?.toFixed(1) ?? '--',
      unit: '%',
      status: getSensorStatus(telemetry?.humidity, 0, 100),
      icon: 'droplet',
      pin: 'GPIO 46 (DHT22)',
    },
    {
      name: 'LDR (Raw)',
      value: telemetry?.ldr ?? '--',
      unit: '',
      status: telemetry?.ldr !== undefined ? 'ok' : 'unknown',
      icon: 'sun',
      pin: 'GPIO 4 (0-4095)',
    },
    {
      name: 'Water Level',
      value: telemetry?.waterLevel?.toFixed(1) ?? '--',
      unit: '%',
      status: getSensorStatus(telemetry?.waterLevel, 0, 100),
      icon: 'layers',
      pin: 'GPIO 16/18 (Ultrasonic)',
    },
    {
      name: 'Feed Level',
      value: telemetry?.feedLevel?.toFixed(1) ?? '--',
      unit: '%',
      status: getSensorStatus(telemetry?.feedLevel, 0, 100),
      icon: 'coffee',
      pin: 'GPIO 12/13 (Ultrasonic)',
    },
  ];

  const actuators: ActuatorState[] = [
    { name: 'Light', target: 'light', isOn: telemetry?.lightOn ?? false, icon: 'sun', pin: 'GPIO 34' },
    { name: 'Fan', target: 'fan', isOn: telemetry?.fanOn ?? false, icon: 'wind', pin: 'GPIO 37' },
    { name: 'Heater', target: 'heater', isOn: telemetry?.heaterOn ?? false, icon: 'thermometer', pin: 'GPIO 38' },
    { name: 'Pump', target: 'pump', isOn: telemetry?.pumpOn ?? false, icon: 'droplet', pin: 'GPIO 36' },
    { name: 'Feed Motor', target: 'feedMotor', isOn: telemetry?.feedMotorOn ?? false, icon: 'rotate-cw', pin: 'GPIO 35' },
    { name: 'Sprayer', target: 'sprayer', isOn: telemetry?.sprayerOn ?? false, icon: 'cloud-rain', pin: 'GPIO 34' },
  ];

  const testConnection = async () => {
    try {
      setConnectionStatus('connecting');
      const client = getDeviceClient(settings);
      const success = await client.testConnection(settings);
      setConnectionStatus(success ? 'connected' : 'error');
      Alert.alert(
        success ? '✅ Connection Successful' : '❌ Connection Failed',
        success
          ? `Connected to device: ${settings.deviceId}`
          : 'Could not connect to the device. Check your settings.'
      );
    } catch (error) {
      setConnectionStatus('error');
      Alert.alert('Connection Error', (error as Error)?.message ?? 'Unknown error');
    }
  };

  const toggleActuator = async (actuator: ActuatorState) => {
    try {
      setTestingActuator(actuator.target);
      const client = getDeviceClient(settings);
      await client.publishCommand({
        target: actuator.target,
        action: actuator.isOn ? 'off' : 'on',
      });
      Alert.alert(
        '✅ Command Sent',
        `${actuator.name} ${actuator.isOn ? 'OFF' : 'ON'} command sent to ESP32`
      );
    } catch (error) {
      Alert.alert('Command Failed', (error as Error)?.message ?? 'Unknown error');
    } finally {
      setTestingActuator(null);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Wait a moment for new data
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const handleToggleLed = useCallback(async () => {
    try {
      setTogglingLed(true);
      const client = getDeviceClient(settings);
      await client.connect(settings);
      await client.publishCommand({target: 'light', action: 'toggle'});
      Alert.alert('✅ Command Sent', 'LED toggle command sent to ESP32');
    } catch (error) {
      Alert.alert('Command Failed', (error as Error)?.message ?? 'Unknown error');
    } finally {
      setTogglingLed(false);
    }
  }, [settings]);

  // HTTP Direct Commands to ESP32
  const sendHttpCommand = useCallback(async (target: ControlTarget, action: 'on' | 'off' | 'toggle') => {
    try {
      setHttpLoading(`${target}-${action}`);
      httpClient.setBaseUrl(esp32Ip);
      const result = await httpClient.sendCommand({ target, action });
      Alert.alert('✅ HTTP Command Sent', `${target.toUpperCase()} ${action.toUpperCase()}\n${result.message || ''}`);
    } catch (error) {
      Alert.alert('❌ HTTP Command Failed', (error as Error)?.message ?? 'Unknown error');
    } finally {
      setHttpLoading(null);
    }
  }, [esp32Ip]);

  const testHttpConnection = useCallback(async () => {
    try {
      setHttpLoading('test');
      httpClient.setBaseUrl(esp32Ip);
      const success = await httpClient.testConnection();
      Alert.alert(
        success ? '✅ ESP32 Connected' : '❌ Connection Failed',
        success ? `Connected to ${esp32Ip}` : `Could not reach ${esp32Ip}`
      );
    } catch (error) {
      Alert.alert('❌ Connection Failed', (error as Error)?.message ?? 'Unknown error');
    } finally {
      setHttpLoading(null);
    }
  }, [esp32Ip]);

  const fetchHttpTelemetry = useCallback(async () => {
    try {
      setHttpLoading('telemetry');
      httpClient.setBaseUrl(esp32Ip);
      const data = await httpClient.getTelemetry();
      Alert.alert('✅ Telemetry Received', JSON.stringify(data, null, 2));
    } catch (error) {
      Alert.alert('❌ Failed to Fetch', (error as Error)?.message ?? 'Unknown error');
    } finally {
      setHttpLoading(null);
    }
  }, [esp32Ip]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'connected':
        return colors.success;
      case 'warning':
        return colors.accentWarn;
      case 'error':
      case 'disconnected':
        return colors.accentError;
      case 'connecting':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return 'check-circle';
      case 'connecting':
        return 'loader';
      case 'error':
        return 'x-circle';
      default:
        return 'wifi-off';
    }
  };

  const timeSinceUpdate = () => {
    if (!lastUpdate) {return 'No data received';}
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) {return `${seconds}s ago`;}
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🔧 Debug Panel</Text>
          <Text style={styles.subtitle}>Test ESP32 connections & sensors</Text>
        </View>

        {/* Connection Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather
              name={getStatusIcon(connectionStatus) as any}
              size={24}
              color={getStatusColor(connectionStatus)}
            />
            <Text style={styles.cardTitle}>Connection Status</Text>
          </View>

          <View style={styles.connectionInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={[styles.statusBadge, { borderColor: getStatusColor(connectionStatus) }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(connectionStatus) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(connectionStatus) }]}>
                  {connectionStatus.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device ID:</Text>
              <Text style={styles.infoValue}>{settings.deviceId || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Transport:</Text>
              <Text style={styles.infoValue}>{settings.transport?.toUpperCase() || 'MQTT'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Data:</Text>
              <Text style={styles.infoValue}>{timeSinceUpdate()}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, connectionStatus === 'connecting' && styles.buttonDisabled]}
            onPress={testConnection}
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <>
                <Feather name="wifi" size={18} color={colors.background} />
                <Text style={styles.buttonText}>Test Connection</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.ledToggleButton, togglingLed && styles.buttonDisabled]}
            onPress={handleToggleLed}
            disabled={togglingLed}
          >
            {togglingLed ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <>
                <Feather name="sun" size={18} color={colors.background} />
                <Text style={styles.buttonText}>💡 Toggle LED Light</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* HTTP Direct Control Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="globe" size={24} color={colors.accentSecondary} />
            <Text style={styles.cardTitle}>HTTP Direct Control</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Send commands directly to ESP32 via HTTP (192.168.4.1)
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ESP32 IP Address</Text>
            <TextInput
              style={styles.ipInput}
              value={esp32Ip}
              onChangeText={setEsp32Ip}
              placeholder="http://192.168.4.1"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.httpButtonRow}>
            <TouchableOpacity
              style={[styles.httpButton, httpLoading === 'test' && styles.buttonDisabled]}
              onPress={testHttpConnection}
              disabled={httpLoading !== null}
            >
              {httpLoading === 'test' ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <>
                  <Feather name="wifi" size={16} color={colors.background} />
                  <Text style={styles.httpButtonText}>Test</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.httpButton, styles.httpButtonSecondary, httpLoading === 'telemetry' && styles.buttonDisabled]}
              onPress={fetchHttpTelemetry}
              disabled={httpLoading !== null}
            >
              {httpLoading === 'telemetry' ? (
                <ActivityIndicator color={colors.accent} size="small" />
              ) : (
                <>
                  <Feather name="download" size={16} color={colors.accent} />
                  <Text style={styles.httpButtonTextSecondary}>Get Data</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.commandSectionTitle}>Quick Commands</Text>

          {/* Light Controls */}
          <View style={styles.commandRow}>
            <Text style={styles.commandLabel}>💡 Light (LED Strip)</Text>
            <View style={styles.commandButtons}>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOn, httpLoading === 'light-on' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('light', 'on')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>ON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOff, httpLoading === 'light-off' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('light', 'off')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>OFF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnToggle, httpLoading === 'light-toggle' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('light', 'toggle')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>TOGGLE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Fan Controls */}
          <View style={styles.commandRow}>
            <Text style={styles.commandLabel}>🌀 Fan</Text>
            <View style={styles.commandButtons}>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOn, httpLoading === 'fan-on' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('fan', 'on')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>ON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOff, httpLoading === 'fan-off' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('fan', 'off')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>OFF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnToggle, httpLoading === 'fan-toggle' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('fan', 'toggle')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>TOGGLE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Heater Controls */}
          <View style={styles.commandRow}>
            <Text style={styles.commandLabel}>🔥 Heater</Text>
            <View style={styles.commandButtons}>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOn, httpLoading === 'heater-on' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('heater', 'on')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>ON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOff, httpLoading === 'heater-off' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('heater', 'off')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>OFF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnToggle, httpLoading === 'heater-toggle' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('heater', 'toggle')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>TOGGLE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pump Controls */}
          <View style={styles.commandRow}>
            <Text style={styles.commandLabel}>💧 Water Pump</Text>
            <View style={styles.commandButtons}>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOn, httpLoading === 'pump-on' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('pump', 'on')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>ON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOff, httpLoading === 'pump-off' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('pump', 'off')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>OFF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnToggle, httpLoading === 'pump-toggle' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('pump', 'toggle')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>TOGGLE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Feed Motor Controls */}
          <View style={styles.commandRow}>
            <Text style={styles.commandLabel}>🥣 Feed Motor</Text>
            <View style={styles.commandButtons}>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOn, httpLoading === 'feedMotor-on' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('feedMotor', 'on')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>ON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOff, httpLoading === 'feedMotor-off' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('feedMotor', 'off')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>OFF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnToggle, httpLoading === 'feedMotor-toggle' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('feedMotor', 'toggle')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>TOGGLE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sprayer Controls */}
          <View style={styles.commandRow}>
            <Text style={styles.commandLabel}>🌧️ Sprayer</Text>
            <View style={styles.commandButtons}>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOn, httpLoading === 'sprayer-on' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('sprayer', 'on')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>ON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnOff, httpLoading === 'sprayer-off' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('sprayer', 'off')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>OFF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cmdBtn, styles.cmdBtnToggle, httpLoading === 'sprayer-toggle' && styles.buttonDisabled]}
                onPress={() => sendHttpCommand('sprayer', 'toggle')}
                disabled={httpLoading !== null}
              >
                <Text style={styles.cmdBtnText}>TOGGLE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sensors Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="cpu" size={24} color={colors.info} />
            <Text style={styles.cardTitle}>Sensor Readings</Text>
          </View>

          {sensors.map((sensor, index) => (
            <View key={sensor.name} style={[styles.sensorRow, index > 0 && styles.sensorRowBorder]}>
              <View style={styles.sensorLeft}>
                <View style={[styles.sensorIcon, { backgroundColor: getStatusColor(sensor.status) + '20' }]}>
                  <Feather name={sensor.icon as any} size={20} color={getStatusColor(sensor.status)} />
                </View>
                <View>
                  <Text style={styles.sensorName}>{sensor.name}</Text>
                  <Text style={styles.sensorPin}>{sensor.pin}</Text>
                </View>
              </View>
              <View style={styles.sensorRight}>
                <Text style={[styles.sensorValue, { color: getStatusColor(sensor.status) }]}>
                  {sensor.value}
                  <Text style={styles.sensorUnit}>{sensor.unit}</Text>
                </Text>
                <View style={[styles.miniStatusBadge, { backgroundColor: getStatusColor(sensor.status) + '20' }]}>
                  <Text style={[styles.miniStatusText, { color: getStatusColor(sensor.status) }]}>
                    {sensor.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Actuators Test Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="zap" size={24} color={colors.accentWarn} />
            <Text style={styles.cardTitle}>Actuator Test</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Tap to toggle each actuator and verify relay connections
          </Text>

          <View style={styles.actuatorGrid}>
            {actuators.map((actuator) => (
              <TouchableOpacity
                key={actuator.target}
                style={[
                  styles.actuatorCard,
                  actuator.isOn && styles.actuatorCardActive,
                  testingActuator === actuator.target && styles.actuatorCardTesting,
                ]}
                onPress={() => toggleActuator(actuator)}
                disabled={testingActuator !== null}
              >
                {testingActuator === actuator.target ? (
                  <ActivityIndicator color={colors.accent} size="small" />
                ) : (
                  <>
                    <View
                      style={[
                        styles.actuatorIcon,
                        actuator.isOn && styles.actuatorIconActive,
                      ]}
                    >
                      <Feather
                        name={actuator.icon as any}
                        size={20}
                        color={actuator.isOn ? colors.background : colors.textSecondary}
                      />
                    </View>
                    <Text style={[styles.actuatorName, actuator.isOn && styles.actuatorNameActive]}>
                      {actuator.name}
                    </Text>
                    <Text style={styles.actuatorPin}>{actuator.pin}</Text>
                    <View style={[styles.actuatorStatus, actuator.isOn && styles.actuatorStatusOn]}>
                      <Text style={[styles.actuatorStatusText, actuator.isOn && styles.actuatorStatusTextOn]}>
                        {actuator.isOn ? 'ON' : 'OFF'}
                      </Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Raw Telemetry Data */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="code" size={24} color={colors.accent} />
            <Text style={styles.cardTitle}>Raw Telemetry Data</Text>
          </View>

          <View style={styles.rawDataContainer}>
            <Text style={styles.rawData}>
              {telemetry
                ? JSON.stringify(telemetry, null, 2)
                : 'No telemetry data received yet.\n\nMake sure:\n1. ESP32 is powered on\n2. WiFi is connected\n3. Firebase credentials match\n4. Device ID matches'}
            </Text>
          </View>
        </View>

        {/* ESP32 Pin Reference */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="map-pin" size={24} color={colors.success} />
            <Text style={styles.cardTitle}>ESP32 Pin Reference</Text>
          </View>

          <View style={styles.pinTable}>
            <View style={styles.pinTableHeader}>
              <Text style={styles.pinTableHeaderText}>Component</Text>
              <Text style={styles.pinTableHeaderText}>GPIO Pin</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>DHT22 (Temp/Humidity)</Text>
              <Text style={styles.pinValue}>GPIO 46</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>LDR (Light Sensor)</Text>
              <Text style={styles.pinValue}>GPIO 4</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>Feed Ultrasonic TRIG</Text>
              <Text style={styles.pinValue}>GPIO 12</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>Feed Ultrasonic ECHO</Text>
              <Text style={styles.pinValue}>GPIO 13</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>Water Ultrasonic TRIG</Text>
              <Text style={styles.pinValue}>GPIO 16</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>Water Ultrasonic ECHO</Text>
              <Text style={styles.pinValue}>GPIO 18</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>NeoPixel LED Strip</Text>
              <Text style={styles.pinValue}>GPIO 1</Text>
            </View>
            <View style={[styles.pinRow, styles.pinRowRelay]}>
              <Text style={styles.pinName}>Light Relay</Text>
              <Text style={styles.pinValue}>GPIO 34</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>Feed Motor Relay</Text>
              <Text style={styles.pinValue}>GPIO 35</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>Pump Relay</Text>
              <Text style={styles.pinValue}>GPIO 36</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>Fan Relay</Text>
              <Text style={styles.pinValue}>GPIO 37</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinName}>Heater Relay</Text>
              <Text style={styles.pinValue}>GPIO 38</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  connectionInfo: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
    gap: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  ledToggleButton: {
    backgroundColor: colors.accentWarn,
    marginTop: spacing.sm,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  sensorRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sensorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sensorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  sensorPin: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  sensorRight: {
    alignItems: 'flex-end',
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  sensorUnit: {
    fontSize: 14,
    fontWeight: '400',
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  miniStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actuatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actuatorCard: {
    width: '31%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actuatorCardActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  actuatorCardTesting: {
    opacity: 0.7,
  },
  actuatorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfacePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actuatorIconActive: {
    backgroundColor: colors.accent,
  },
  actuatorName: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  actuatorNameActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actuatorPin: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  actuatorStatus: {
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  actuatorStatusOn: {
    backgroundColor: colors.accent,
  },
  actuatorStatusText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  actuatorStatusTextOn: {
    color: colors.background,
  },
  rawDataContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
  },
  rawData: {
    color: colors.accent,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  pinTable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  pinTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
  },
  pinTableHeaderText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pinRowRelay: {
    backgroundColor: colors.surfaceSecondary,
    marginTop: spacing.xs,
  },
  pinName: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  pinValue: {
    color: colors.info,
    fontSize: 13,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
  // HTTP Direct Control Styles
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  ipInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.textPrimary,
    fontSize: 14,
  },
  httpButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  httpButton: {
    flex: 1,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 10,
    gap: spacing.xs,
  },
  httpButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  httpButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  httpButtonTextSecondary: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  commandSectionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  commandRow: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commandLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  commandButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  cmdBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cmdBtnOn: {
    backgroundColor: colors.success,
  },
  cmdBtnOff: {
    backgroundColor: colors.accentError,
  },
  cmdBtnToggle: {
    backgroundColor: colors.accentWarn,
  },
  cmdBtnText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default DebugScreen;
