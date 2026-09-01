import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { AppointmentStatus } from '../types';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  zakazano: 'Zakazano',
  potvrdjeno: 'Potvrđeno',
  otkazano: 'Otkazano',
};

const STATUS_COLOR: Record<AppointmentStatus, { fg: string; bg: string }> = {
  zakazano: { fg: colors.statusZakazano, bg: colors.statusZakazanoBg },
  potvrdjeno: { fg: colors.statusPotvrdjeno, bg: colors.statusPotvrdjenoBg },
  otkazano: { fg: colors.statusOtkazano, bg: colors.statusOtkazanoBg },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.fg }]} />
      <Text style={[styles.text, { color: c.fg }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { ...typography.label },
});
