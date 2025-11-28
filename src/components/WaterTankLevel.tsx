import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@theme';

interface WaterTankLevelProps {
    value: number; // 0 to 100
    capacity?: string;
    status?: 'ok' | 'warn' | 'critical';
}

export const WaterTankLevel = ({
    value,
    capacity = '500L',
    status = 'ok',
}: WaterTankLevelProps) => {
    const width = 120;
    const height = 140;
    const tankPadding = 10;
    const fillHeight = (Math.min(Math.max(value, 0), 100) / 100) * (height - 2 * tankPadding);

    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={colors.waterGradientStart} stopOpacity="0.8" />
                        <Stop offset="1" stopColor={colors.waterGradientEnd} stopOpacity="0.9" />
                    </LinearGradient>
                </Defs>

                {/* Tank Body */}
                <Rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    rx="12"
                    ry="12"
                    fill={colors.surfaceSecondary}
                    stroke={colors.border}
                    strokeWidth="2"
                />

                {/* Liquid */}
                <Rect
                    x={tankPadding}
                    y={height - tankPadding - fillHeight}
                    width={width - 2 * tankPadding}
                    height={fillHeight}
                    rx="4"
                    ry="4"
                    fill="url(#waterGrad)"
                />

                {/* Measurement Lines */}
                <Rect x={width - 20} y={height * 0.25} width="10" height="2" fill={colors.textSecondary} opacity="0.3" />
                <Rect x={width - 20} y={height * 0.5} width="10" height="2" fill={colors.textSecondary} opacity="0.3" />
                <Rect x={width - 20} y={height * 0.75} width="10" height="2" fill={colors.textSecondary} opacity="0.3" />
            </Svg>

            <View style={styles.overlay}>
                <Text style={styles.valueText}>{Math.round(value)}%</Text>
                <Text style={styles.capacityText}>{capacity}</Text>
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
    },
    valueText: {
        color: colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    capacityText: {
        color: colors.textPrimary,
        fontSize: 12,
        opacity: 0.8,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
