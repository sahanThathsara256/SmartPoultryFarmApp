import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '@theme';

interface WaterTankLevelProps {
    value: number; // 0 to 100
    capacity?: string;
    status?: 'ok' | 'warn' | 'critical';
}

export const WaterTankLevel = ({
    value,
    capacity = '500L',
}: WaterTankLevelProps) => {
    const width = 120;
    const height = 180;
    const fillPercentage = Math.min(Math.max(value, 0), 100) / 100;

    // Tank dimensions
    const tankWidth = 100;
    const tankHeight = 140;
    const tankX = (width - tankWidth) / 2;
    const tankY = 30; // Space for lid

    // Lid dimensions
    const lidWidth = 110;
    const lidHeight = 15;
    const lidX = (width - lidWidth) / 2;
    const lidY = 15;

    // Calculate fill height
    const maxFillHeight = tankHeight - 10; // Padding inside
    const currentFillHeight = maxFillHeight * fillPercentage;
    const fillY = tankY + tankHeight - 5 - currentFillHeight; // Bottom up

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
                        <Stop offset="0" stopColor="white" stopOpacity="0.1" />
                        <Stop offset="0.2" stopColor="white" stopOpacity="0.05" />
                        <Stop offset="0.5" stopColor="white" stopOpacity="0" />
                        <Stop offset="0.8" stopColor="white" stopOpacity="0.05" />
                        <Stop offset="1" stopColor="white" stopOpacity="0.1" />
                    </LinearGradient>
                    <LinearGradient id="waterTankLidGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#4B5563" />
                        <Stop offset="1" stopColor="#1F2937" />
                    </LinearGradient>
                </Defs>

                {/* Lid */}
                <Rect
                    x={lidX}
                    y={lidY}
                    width={lidWidth}
                    height={lidHeight}
                    rx="4"
                    fill="url(#waterTankLidGrad)"
                />

                {/* Tank Body Outline */}
                <Rect
                    x={tankX}
                    y={tankY}
                    width={tankWidth}
                    height={tankHeight}
                    rx="12"
                    stroke="#374151"
                    strokeWidth="2"
                    fill="rgba(31, 41, 55, 0.3)"
                />

                {/* Water Fill */}
                <Rect
                    x={tankX + 4}
                    y={fillY}
                    width={tankWidth - 8}
                    height={currentFillHeight}
                    rx="8"
                    fill="url(#waterTankGrad)"
                />

                {/* Surface Line */}
                <Rect
                    x={tankX + 4}
                    y={fillY}
                    width={tankWidth - 8}
                    height={4}
                    fill="rgba(255,255,255,0.3)"
                />

                {/* Glass Reflection */}
                <Rect
                    x={tankX}
                    y={tankY}
                    width={tankWidth}
                    height={tankHeight}
                    rx="12"
                    fill="url(#waterTankGlassGrad)"
                />

                {/* Measurement Lines */}
                <Path d={`M ${tankX + 10} ${tankY + tankHeight * 0.25} H ${tankX + tankWidth - 10}`} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <Path d={`M ${tankX + 10} ${tankY + tankHeight * 0.5} H ${tankX + tankWidth - 10}`} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <Path d={`M ${tankX + 10} ${tankY + tankHeight * 0.75} H ${tankX + tankWidth - 10}`} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </Svg>

            <View style={styles.textContainer}>
                <Text style={styles.percentageText}>{Math.round(value)}%</Text>
                <Text style={styles.capacityText}>{Math.round(parseInt(capacity, 10) * (value / 100))}L / {capacity}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        alignItems: 'center',
        marginTop: -10,
    },
    percentageText: {
        color: '#3B82F6',
        fontSize: 32,
        fontWeight: 'bold',
    },
    capacityText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
});
