import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { colors } from '@theme';

interface FeedContainerLevelProps {
    value: number; // 0 to 100
    capacity?: string;
    status?: 'ok' | 'warn' | 'critical';
}

export const FeedContainerLevel = ({
    value,
    capacity = '50kg',
}: FeedContainerLevelProps) => {
    const width = 120;
    const height = 180;
    const fillPercentage = Math.min(Math.max(value, 0), 100) / 100;

    // Trapezoid dimensions
    const topWidth = 60;
    const bottomWidth = 100;
    const containerHeight = 140;
    const containerY = 20;

    // Calculate fill height
    const currentFillHeight = containerHeight * fillPercentage;
    const fillY = containerY + containerHeight - currentFillHeight;

    // Calculate width at fill level (linear interpolation)
    const fillTopWidth = bottomWidth - ((bottomWidth - topWidth) * (currentFillHeight / containerHeight));
    const fillTopX = (width - fillTopWidth) / 2;

    // Generate random dots for grain texture
    const dots = React.useMemo(() => {
        const dotArray = [];
        for (let i = 0; i < 20; i++) {
            dotArray.push({
                x: Math.random() * (bottomWidth - 20) + 10,
                y: Math.random() * (currentFillHeight - 10) + 5,
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
                        <Stop offset="0" stopColor="white" stopOpacity="0.1" />
                        <Stop offset="0.5" stopColor="white" stopOpacity="0" />
                        <Stop offset="1" stopColor="white" stopOpacity="0.1" />
                    </LinearGradient>
                </Defs>

                {/* Container Outline (Trapezoid) */}
                <Path
                    d={`
                        M ${(width - topWidth) / 2} ${containerY}
                        L ${(width + topWidth) / 2} ${containerY}
                        L ${(width + bottomWidth) / 2} ${containerY + containerHeight}
                        L ${(width - bottomWidth) / 2} ${containerY + containerHeight}
                        Z
                    `}
                    fill="rgba(31, 41, 55, 0.3)"
                    stroke="#374151"
                    strokeWidth="2"
                />

                {/* Feed Fill (Trapezoid) */}
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

                {/* Grain Texture (Dots) */}
                {dots.map((dot, i) => (
                    <Circle
                        key={i}
                        cx={(width - bottomWidth) / 2 + dot.x}
                        cy={fillY + dot.y}
                        r={dot.r}
                        fill="#78350F"
                        opacity={dot.opacity}
                    />
                ))}

                {/* Glass Reflection */}
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

                {/* Measurement Lines */}
                <Path d={`M ${(width - bottomWidth) / 2 + 10} ${containerY + containerHeight * 0.25} H ${(width + bottomWidth) / 2 - 10}`} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <Path d={`M ${(width - bottomWidth) / 2 + 5} ${containerY + containerHeight * 0.5} H ${(width + bottomWidth) / 2 - 5}`} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <Path d={`M ${(width - bottomWidth) / 2} ${containerY + containerHeight * 0.75} H ${(width + bottomWidth) / 2}`} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                {/* Dispenser/Bottom Detail */}
                <Rect
                    x={(width - 20) / 2}
                    y={containerY + containerHeight - 5}
                    width={20}
                    height={15}
                    rx={4}
                    fill="#374151"
                    stroke="#4B5563"
                />
            </Svg>

            <View style={styles.textContainer}>
                <Text style={styles.percentageText}>{Math.round(value)}%</Text>
                <Text style={styles.capacityText}>{Math.round(parseInt(capacity, 10) * (value / 100))}kg / {capacity}</Text>
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
        color: '#F59E0B',
        fontSize: 32,
        fontWeight: 'bold',
    },
    capacityText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
});
