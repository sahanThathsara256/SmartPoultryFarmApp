import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, ClipPath, Defs, G, LinearGradient, Path, Stop} from 'react-native-svg';
import {useThemeColors} from '@theme';

interface HumidityGaugeProps {
  value: number;
  status?: 'optimal' | 'low' | 'high';
}

export const HumidityGauge = ({value}: HumidityGaugeProps) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const radius = 50;
  const size = radius * 2;
  const fillPercent = Math.min(Math.max(value, 0), 100) / 100;
  const waveHeight = size * fillPercent;
  const yOffset = size - waveHeight;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="humidGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.humidityGradientStart} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.humidityGradientEnd} stopOpacity="1" />
          </LinearGradient>
          <ClipPath id="circleClip">
            <Circle cx={radius} cy={radius} r={radius} />
          </ClipPath>
        </Defs>

        <Circle cx={radius} cy={radius} r={radius} fill={colors.surfaceSecondary} />

        <G clipPath="url(#circleClip)">
          <Path d={`M0,${yOffset} Q${radius},${yOffset - 10} ${size},${yOffset} V${size} H0 Z`} fill="url(#humidGrad)" />
        </G>
      </Svg>

      <View style={styles.overlay}>
        <Text style={styles.valueText}>{Math.round(value)}%</Text>
      </View>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    overlay: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    valueText: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: 'bold',
      textShadowColor: colors.background === '#F6F8FC' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
    },
  });
