export type ThemeMode = 'dark' | 'light';

export type AppColors = {
  background: string;
  surfacePrimary: string;
  surfaceSecondary: string;
  accent: string;
  accentSecondary: string;
  accentWarn: string;
  accentError: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
  info: string;
  tempGradientStart: string;
  tempGradientEnd: string;
  humidityGradientStart: string;
  humidityGradientEnd: string;
  waterGradientStart: string;
  waterGradientEnd: string;
  cardBackground: string;
  gaugeBackground: string;
};

export const darkColors: AppColors = {
  background: '#0B1221',
  surfacePrimary: '#111B2C',
  surfaceSecondary: '#1C273A',
  accent: '#4ADE80',
  accentSecondary: '#22D3EE',
  accentWarn: '#F97316',
  accentError: '#F43F5E',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#18263D',
  success: '#22C55E',
  info: '#0EA5E9',
  tempGradientStart: '#FFD700',
  tempGradientEnd: '#22C55E',
  humidityGradientStart: '#22D3EE',
  humidityGradientEnd: '#0EA5E9',
  waterGradientStart: '#22D3EE',
  waterGradientEnd: '#0EA5E9',
  cardBackground: '#151F32',
  gaugeBackground: '#1E293B',
};

export const lightColors: AppColors = {
  background: '#F6F8FC',
  surfacePrimary: '#FFFFFF',
  surfaceSecondary: '#EEF2F8',
  accent: '#16A34A',
  accentSecondary: '#0891B2',
  accentWarn: '#EA580C',
  accentError: '#E11D48',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  border: '#D7DFEA',
  success: '#15803D',
  info: '#0284C7',
  tempGradientStart: '#F59E0B',
  tempGradientEnd: '#16A34A',
  humidityGradientStart: '#06B6D4',
  humidityGradientEnd: '#0EA5E9',
  waterGradientStart: '#06B6D4',
  waterGradientEnd: '#0284C7',
  cardBackground: '#FFFFFF',
  gaugeBackground: '#E5ECF5',
};

export const themeColors: Record<ThemeMode, AppColors> = {
  dark: darkColors,
  light: lightColors,
};

export const colors = darkColors;
