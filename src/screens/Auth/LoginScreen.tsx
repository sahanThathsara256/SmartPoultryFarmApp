import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '@navigation/types';
import {useAuthStore} from '@store/useAuthStore';
import {colors, spacing} from '@theme';
import {validateEmail, validatePassword} from '@utils/validation';

const LoginScreen = ({navigation}: NativeStackScreenProps<AuthStackParamList, 'Login'>) => {
  const login = useAuthStore(state => state.login);
  const [email, setEmail] = useState('farmer@coop.io');
  const [password, setPassword] = useState('secret123');

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid email');
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert('Password must be at least 6 characters');
      return;
    }
    await login(email, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Monitor and control your coop in realtime.</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="farmer@example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          style={styles.input}
        />
      </View>

      <Pressable style={styles.primaryBtn} onPress={handleLogin}>
        <Text style={styles.primaryText}>Log In</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.footerText}>Create account</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  formGroup: {
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
  primaryBtn: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 14,
    marginTop: spacing.lg,
  },
  primaryText: {
    color: '#02120f',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default LoginScreen;
