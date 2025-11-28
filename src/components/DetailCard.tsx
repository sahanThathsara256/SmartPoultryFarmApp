import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@theme';

interface DetailCardProps {
    label: string;
    value: string;
    subLabel?: string;
    subValue?: string;
    accentColor?: string;
}

export const DetailCard = ({
    label,
    value,
    subLabel,
    subValue,
    accentColor = colors.textPrimary,
}: DetailCardProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.mainRow}>
                <Text style={styles.label}>{label}</Text>
                <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
            </View>
            {(subLabel || subValue) && (
                <View style={styles.subRow}>
                    {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
                    {subValue && <Text style={[styles.subValue, { color: accentColor }]}>{subValue}</Text>}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surfaceSecondary,
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    mainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    label: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
    },
    subRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    subLabel: {
        color: colors.textSecondary,
        fontSize: 10,
        opacity: 0.7,
    },
    subValue: {
        fontSize: 12,
        fontWeight: '500',
    },
});
