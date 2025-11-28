import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing} from '@theme';

interface Props {
  label: string;
  value: string;
  unit?: string;
  status?: 'ok' | 'warn' | 'error';
  footer?: string;
}

export const TelemetryCard: React.FC<Props> = ({label, value, unit, status = 'ok', footer}) => {
  return (
    <View style={[styles.card, statusStyles[status]]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {footer && <Text style={styles.footer}>{footer}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 140,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '600',
  },
  unit: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    marginBottom: 6,
  },
  footer: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSecondary,
  },
});

const statusStyles = StyleSheet.create({
  ok: {},
  warn: {
    borderColor: colors.accentWarn,
  },
  error: {
    borderColor: colors.accentError,
  },
});
