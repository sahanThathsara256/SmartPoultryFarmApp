import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {colors} from '@theme';

const SplashScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Smart Poultry Farm</Text>
    <ActivityIndicator color={colors.accent} size="large" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
});

export default SplashScreen;
