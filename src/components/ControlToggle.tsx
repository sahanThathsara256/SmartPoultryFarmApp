import React from 'react';
import {Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import {spacing, useThemeColors} from '@theme';
import {ControlTarget} from '@types';

interface Props {
  target: ControlTarget;
  label: string;
  isOn: boolean;
  isBusy?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onToggle: (target: ControlTarget, next: boolean) => void;
}

export const ControlToggle: React.FC<Props> = ({
  target,
  label,
  isOn,
  onToggle,
  isBusy,
  disabled,
  disabledReason,
}) => {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const isDisabled = isBusy || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.card, isOn ? styles.cardOn : null, isDisabled ? styles.cardDisabled : null]}
      disabled={isDisabled}>
      <View style={styles.row}>
        <Text style={[styles.label, disabled ? styles.labelDisabled : null]}>{label}</Text>
        <Switch
          value={isOn}
          onValueChange={() => onToggle(target, !isOn)}
          disabled={isDisabled}
          thumbColor={colors.surfacePrimary}
          trackColor={{false: colors.border, true: colors.accent}}
        />
      </View>
      {isBusy ? <Text style={styles.helper}>Syncing...</Text> : null}
      {!isBusy && disabled && disabledReason ? <Text style={styles.helper}>{disabledReason}</Text> : null}
    </Pressable>
  );
};

const makeStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surfacePrimary,
      padding: spacing.md,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    cardOn: {
      borderColor: colors.accent,
      backgroundColor: colors.background === '#F6F8FC' ? 'rgba(22, 163, 74, 0.08)' : colors.surfacePrimary,
    },
    cardDisabled: {
      opacity: 0.55,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '500',
    },
    labelDisabled: {
      color: colors.textSecondary,
    },
    helper: {
      marginTop: spacing.sm,
      color: colors.textSecondary,
      fontSize: 12,
    },
  });
