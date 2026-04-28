import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';
import {useThemeColors} from '@theme';

interface WaterTankLevelProps {
  value: number;
  capacity?: string;
  status?: 'ok' | 'warn' | 'critical';
}

export const WaterTankLevel = ({value, capacity = '500L'}: WaterTankLevelProps) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const width = 120;
  const height = 180;
  const fillPercentage = Math.min(Math.max(value, 0), 100) / 100;
  const tankWidth = 100;
  const tankHeight = 140;
  const tankX = (width - tankWidth) / 2;
  const tankY = 30;
  const lidWidth = 110;
  const lidHeight = 15;
  const lidX = (width - lidWidth) / 2;
  const lidY = 15;
  const maxFillHeight = tankHeight - 10;
  const currentFillHeight = maxFillHeight * fillPercentage;
  const fillY = tankY + tankHeight - 5 - currentFillHeight;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="waterTankGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#4ADE80" stopOpacity="0.8" />
            <Stop offset="0.5" stopColor="#3B82F6" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#2563EB" stopOpacity="0.9" />
          </LinearGradient>
          <LinearGradient id="waterTankGlassGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={colors.background === '#F6F8FC' ? '0.18' : '0.1'} />
            <Stop offset="0.2" stopColor="#FFFFFF" stopOpacity={colors.background === '#F6F8FC' ? '0.08' : '0.05'} />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="0.8" stopColor="#FFFFFF" stopOpacity={colors.background === '#F6F8FC' ? '0.08' : '0.05'} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={colors.background === '#F6F8FC' ? '0.18' : '0.1'} />
          </LinearGradient>
          <LinearGradient id="waterTankLidGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.background === '#F6F8FC' ? '#CBD5E1' : '#4B5563'} />
            <Stop offset="1" stopColor={colors.background === '#F6F8FC' ? '#64748B' : '#1F2937'} />
          </LinearGradient>
        </Defs>

        <Rect x={lidX} y={lidY} width={lidWidth} height={lidHeight} rx="4" fill="url(#waterTankLidGrad)" />

        <Rect
          x={tankX}
          y={tankY}
          width={tankWidth}
          height={tankHeight}
          rx="12"
          stroke={colors.border}
          strokeWidth="2"
          fill={colors.background === '#F6F8FC' ? 'rgba(255,255,255,0.8)' : 'rgba(31, 41, 55, 0.3)'}
        />

        <Rect x={tankX + 4} y={fillY} width={tankWidth - 8} height={currentFillHeight} rx="8" fill="url(#waterTankGrad)" />

        <Rect x={tankX + 4} y={fillY} width={tankWidth - 8} height={4} fill="rgba(255,255,255,0.35)" />

        <Rect x={tankX} y={tankY} width={tankWidth} height={tankHeight} rx="12" fill="url(#waterTankGlassGrad)" />

        <Path d={`M ${tankX + 10} ${tankY + tankHeight * 0.25} H ${tankX + tankWidth - 10}`} stroke={colors.border} strokeOpacity="0.5" strokeWidth="1" />
        <Path d={`M ${tankX + 10} ${tankY + tankHeight * 0.5} H ${tankX + tankWidth - 10}`} stroke={colors.border} strokeOpacity="0.5" strokeWidth="1" />
        <Path d={`M ${tankX + 10} ${tankY + tankHeight * 0.75} H ${tankX + tankWidth - 10}`} stroke={colors.border} strokeOpacity="0.5" strokeWidth="1" />
      </Svg>

      <View style={styles.textContainer}>
        <Text style={styles.percentageText}>{Math.round(value)}%</Text>
        <Text style={styles.capacityText}>
          {Math.round(parseInt(capacity, 10) * (value / 100))}L / {capacity}
        </Text>
      </View>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    textContainer: {
      alignItems: 'center',
      marginTop: -10,
    },
    percentageText: {
      color: colors.info,
      fontSize: 32,
      fontWeight: 'bold',
    },
    capacityText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
  });
