import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface StatTileProps {
  value: string | number;
  label: string;
}

export function StatTile({ value, label }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
    </View>
  );
}

// Red od N statistika, jednake širine (npr. "2 NADOLAZEĆI · 1 ZAVRŠENI · 1 OTKAZANI").
export function StatTileRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: { ...typography.statNumber, color: colors.accent },
  label: { ...typography.mono, color: colors.textSecondary, fontSize: 10 },
});
