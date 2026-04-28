import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';
import {useThemeColors} from '@theme';

interface FeedContainerLevelProps {
  value: number;
  capacity?: string;
  status?: 'ok' | 'warn' | 'critical';
}

export const FeedContainerLevel = ({value, capacity = '50kg'}: FeedContainerLevelProps) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const width = 120;
  const height = 180;
  const fillPercentage = Math.min(Math.max(value, 0), 100) / 100;
  const topWidth = 60;
  const bottomWidth = 100;
  const containerHeight = 140;
  const containerY = 20;
  const currentFillHeight = containerHeight * fillPercentage;
  const fillY = containerY + containerHeight - currentFillHeight;
  const fillTopWidth = bottomWidth - ((bottomWidth - topWidth) * (currentFillHeight / containerHeight));
  const fillTopX = (width - fillTopWidth) / 2;

  const dots = React.useMemo(() => {
    const dotArray = [];
    for (let i = 0; i < 20; i++) {
      dotArray.push({
        x: Math.random() * (bottomWidth - 20) + 10,
        y: Math.random() * Math.max(currentFillHeight - 10, 1) + 5,
        r: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
    return dotArray;
  }, [currentFillHeight]);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="feedContainerGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F59E0B" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#D97706" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="feedContainerGlassGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={colors.background === '#F6F8FC' ? '0.18' : '0.1'} />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={colors.background === '#F6F8FC' ? '0.18' : '0.1'} />
          </LinearGradient>
        </Defs>

        <Path
          d={`
            M ${(width - topWidth) / 2} ${containerY}
            L ${(width + topWidth) / 2} ${containerY}
            L ${(width + bottomWidth) / 2} ${containerY + containerHeight}
            L ${(width - bottomWidth) / 2} ${containerY + containerHeight}
            Z
          `}
          fill={colors.background === '#F6F8FC' ? 'rgba(255,255,255,0.86)' : 'rgba(31, 41, 55, 0.3)'}
          stroke={colors.border}
          strokeWidth="2"
        />

        <Path
          d={`
            M ${fillTopX} ${fillY}
            L ${width - fillTopX} ${fillY}
            L ${(width + bottomWidth) / 2 - 2} ${containerY + containerHeight - 2}
            L ${(width - bottomWidth) / 2 + 2} ${containerY + containerHeight - 2}
            Z
          `}
          fill="url(#feedContainerGrad)"
        />

        {dots.map((dot, index) => (
          <Circle
            key={index}
            cx={(width - bottomWidth) / 2 + dot.x}
            cy={fillY + dot.y}
            r={dot.r}
            fill="#78350F"
            opacity={dot.opacity}
          />
        ))}

        <Path
          d={`
            M ${(width - topWidth) / 2} ${containerY}
            L ${(width + topWidth) / 2} ${containerY}
            L ${(width + bottomWidth) / 2} ${containerY + containerHeight}
            L ${(width - bottomWidth) / 2} ${containerY + containerHeight}
            Z
          `}
          fill="url(#feedContainerGlassGrad)"
        />

        <Path d={`M ${(width - bottomWidth) / 2 + 10} ${containerY + containerHeight * 0.25} H ${(width + bottomWidth) / 2 - 10}`} stroke={colors.border} strokeOpacity="0.5" strokeWidth="1" />
        <Path d={`M ${(width - bottomWidth) / 2 + 5} ${containerY + containerHeight * 0.5} H ${(width + bottomWidth) / 2 - 5}`} stroke={colors.border} strokeOpacity="0.5" strokeWidth="1" />
        <Path d={`M ${(width - bottomWidth) / 2} ${containerY + containerHeight * 0.75} H ${(width + bottomWidth) / 2}`} stroke={colors.border} strokeOpacity="0.5" strokeWidth="1" />

        <Rect
          x={(width - 20) / 2}
          y={containerY + containerHeight - 5}
          width={20}
          height={15}
          rx={4}
          fill={colors.background === '#F6F8FC' ? '#94A3B8' : '#374151'}
          stroke={colors.border}
        />
      </Svg>

      <View style={styles.textContainer}>
        <Text style={styles.percentageText}>{Math.round(value)}%</Text>
        <Text style={styles.capacityText}>
          {Math.round(parseInt(capacity, 10) * (value / 100))}kg / {capacity}
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
      color: colors.accentWarn,
      fontSize: 32,
      fontWeight: 'bold',
    },
    capacityText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
  });
