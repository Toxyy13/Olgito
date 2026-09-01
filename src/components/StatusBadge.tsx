import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { AppointmentStatus } from '../types';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  zakazano: 'Zakazano',
  potvrdjeno: 'Potvrđeno',
  otkazano: 'Otkazano',
};

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  zakazano: colors.statusZakazano,
  potvrdjeno: colors.statusPotvrdjeno,
  otkazano: colors.statusOtkazano,
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLOR[status] }]}>
      <Text style={styles.text}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  text: { ...typography.label, color: colors.textOnPrimary },
});
