import React, {ReactNode} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {colors, spacing} from '@theme';

interface Props {
  title: string;
  enabled?: boolean;
  onToggle?: (value: boolean) => void;
  children?: ReactNode;
}

export const RuleSection: React.FC<Props> = ({title, enabled, onToggle, children}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {typeof enabled === 'boolean' && onToggle && (
          <Switch
            value={enabled}
            onValueChange={onToggle}
            thumbColor={colors.surfacePrimary}
            trackColor={{false: colors.border, true: colors.accent}}
          />
        )}
      </View>
      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
