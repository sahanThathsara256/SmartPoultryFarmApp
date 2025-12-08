import React from 'react';
import {Pressable, StyleSheet, Text, View, Switch} from 'react-native';
import {colors, spacing} from '@theme';
import {ControlTarget} from '@types';
interface Props {
  target: ControlTarget;
  label: string;
  isOn: boolean;
  isBusy?: boolean;
  onToggle: (target: ControlTarget, next: boolean) => void;
}

export const ControlToggle: React.FC<Props> = ({target, label, isOn, onToggle, isBusy}) => {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.card, isOn ? styles.cardOn : styles.cardOff]}
      disabled={isBusy}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          value={isOn}
          onValueChange={() => onToggle(target, !isOn)}
          thumbColor={isOn ? colors.surfacePrimary : colors.surfacePrimary}
          trackColor={{false: colors.border, true: colors.accent}}
        />
        {/* <Text style={[styles.state, isOn ? styles.stateOn : styles.stateOff]}>{isOn ? 'ON' : 'OFF'}</Text> */}
      </View>
      {isBusy && <Text style={styles.helper}>Syncing…</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
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
  },
  cardOff: {},
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
  state: {
    fontWeight: '600',
  },
  stateOn: {
    color: colors.accent,
  },
  stateOff: {
    color: colors.textSecondary,
  },
  helper: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
