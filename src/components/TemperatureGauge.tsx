import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { colors } from '@theme';

interface TemperatureGaugeProps {
    value: number;
    min?: number;
    max?: number;
    unit?: string;
}

export const TemperatureGauge = ({
    value,
    min = 15,
    max = 35,
    unit = '°C',
}: TemperatureGaugeProps) => {
    const radius = 60;
    const strokeWidth = 12;
    const center = radius + strokeWidth;

    // Calculate percentage
    const clampedValue = Math.min(Math.max(value, min), max);
    const percentage = (clampedValue - min) / (max - min);

    // Arc configuration (240 degrees)
    const startAngle = 150;
    const endAngle = 390; // 150 + 240
    const angleRange = 240;

    const progressAngle = startAngle + (angleRange * percentage);

    // Helper to calculate coordinates
    const polarToCartesian = (centerX: number, centerY: number, arcRadius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (arcRadius * Math.cos(angleInRadians)),
            y: centerY + (arcRadius * Math.sin(angleInRadians)),
        };
    };

    const createArc = (centerX: number, centerY: number, arcRadius: number, fromAngle: number, toAngle: number) => {
        const start = polarToCartesian(centerX, centerY, arcRadius, toAngle);
        const end = polarToCartesian(centerX, centerY, arcRadius, fromAngle);
        const largeArcFlag = toAngle - fromAngle <= 180 ? '0' : '1';
        return [
            'M', start.x, start.y,
            'A', arcRadius, arcRadius, 0, largeArcFlag, 0, end.x, end.y,
        ].join(' ');
    };

    return (
        <View style={styles.container}>
            <Svg width={center * 2} height={center * 2}>
                <Defs>
                    <LinearGradient id="tempGrad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor={colors.tempGradientStart} stopOpacity="1" />
                        <Stop offset="1" stopColor={colors.tempGradientEnd} stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Background Track */}
                <Path
                    d={createArc(center, center, radius, startAngle, endAngle)}
                    stroke={colors.surfaceSecondary}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Progress Arc */}
                <Path
                    d={createArc(center, center, radius, startAngle, progressAngle)}
                    stroke="url(#tempGrad)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                />
            </Svg>

            <View style={styles.valueContainer}>
                <Text style={styles.valueText}>{value.toFixed(1)}</Text>
                <Text style={styles.unitText}>{unit}</Text>
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
    valueContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    valueText: {
        color: colors.textPrimary,
        fontSize: 32,
        fontWeight: 'bold',
    },
    unitText: {
        color: colors.textSecondary,
        fontSize: 16,
        marginTop: -4,
    },
});
