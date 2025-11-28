import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Path, ClipPath, G } from 'react-native-svg';
import { colors } from '@theme';

interface HumidityGaugeProps {
    value: number; // 0 to 100
    status?: 'optimal' | 'low' | 'high';
}

export const HumidityGauge = ({
    value,
    status = 'optimal',
}: HumidityGaugeProps) => {
    const radius = 50;
    const size = radius * 2;
    const fillPercent = Math.min(Math.max(value, 0), 100) / 100;

    // Create a wave path
    // Simple approximation: a rectangle with a wavy top
    // For a static view, a flat level or slight curve is fine. 
    // Let's do a flat level for robustness or a simple curve.
    // To make it look like the design (liquid ball), we clip a rect with the circle.

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

                {/* Background Circle */}
                <Circle
                    cx={radius}
                    cy={radius}
                    r={radius}
                    fill={colors.surfaceSecondary}
                />

                {/* Liquid Fill */}
                <G clipPath="url(#circleClip)">
                    <Path
                        d={`M0,${yOffset} Q${radius},${yOffset - 10} ${size},${yOffset} V${size} H0 Z`}
                        fill="url(#humidGrad)"
                    />
                </G>
            </Svg>

            <View style={styles.overlay}>
                <Text style={styles.valueText}>{Math.round(value)}%</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
