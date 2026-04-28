import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {spacing, useThemeColors} from '@theme';

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
  accentColor,
}: DetailCardProps) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const resolvedAccent = accentColor ?? colors.textPrimary;

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, {color: resolvedAccent}]}>{value}</Text>
      </View>
      {(subLabel || subValue) && (
        <View style={styles.subRow}>
          {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
          {subValue ? <Text style={[styles.subValue, {color: resolvedAccent}]}>{subValue}</Text> : null}
        </View>
      )}
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
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
