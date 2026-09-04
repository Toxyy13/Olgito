import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

// Red pilula za filtriranje (npr. "SVI / NADOLAZEĆI / PROŠLI") — aktivna je puna
// žuta pilula, ostale su providne.
export function FilterPills<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable key={opt.value} onPress={() => onChange(opt.value)} style={[styles.pill, active && styles.pillActive]}>
            <Text style={[styles.text, active && styles.textActive]}>{opt.label.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  pillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { ...typography.mono, color: colors.textSecondary },
  textActive: { color: colors.background, fontFamily: typography.monoBold.fontFamily },
});
