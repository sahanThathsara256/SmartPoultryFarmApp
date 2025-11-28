import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '@navigation/types';
import {useAuthStore} from '@store/useAuthStore';
import {colors, spacing} from '@theme';
import {validateEmail, validatePassword} from '@utils/validation';

const SignupScreen = ({navigation}: NativeStackScreenProps<AuthStackParamList, 'Signup'>) => {
  const signup = useAuthStore(state => state.signup);
  const [email, setEmail] = useState('farmer@coop.io');
  const [password, setPassword] = useState('secret123');
  const [confirmPassword, setConfirmPassword] = useState('secret123');

  const handleSignup = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid email');
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    await signup(email, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>We will sync your farm with this account.</Text>

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

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          style={styles.input}
        />
      </View>

      <Pressable style={styles.primaryBtn} onPress={handleSignup}>
        <Text style={styles.primaryText}>Sign Up</Text>
      </Pressable>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.footerText}>Back to login</Text>
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
    backgroundColor: colors.accentSecondary,
    padding: spacing.md,
    borderRadius: 14,
    marginTop: spacing.lg,
  },
  primaryText: {
    color: '#031218',
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

export default SignupScreen;
