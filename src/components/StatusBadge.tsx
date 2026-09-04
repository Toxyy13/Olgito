import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { AppointmentStatus } from '../types';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  zakazano: 'Zakazano',
  potvrdjeno: 'Potvrđeno',
  otkazano: 'Otkazano',
};

// Puna, zasićena pozadina (90% neprozirnosti) — tamnozeleni tekst svuda osim
// na crvenoj "otkazano" pozadini, gde tamnozeleni tekst nema kontrast pa
// ostaje beo. Isto pravilo kao u referentnom dizajnu.
const STATUS_BG: Record<AppointmentStatus, string> = {
  zakazano: 'rgba(255,183,3,0.9)',
  potvrdjeno: 'rgba(45,198,83,0.9)',
  otkazano: 'rgba(230,57,70,0.9)',
};
const STATUS_TEXT: Record<AppointmentStatus, string> = {
  zakazano: colors.statusTextOnPastel,
  potvrdjeno: colors.statusTextOnPastel,
  otkazano: colors.textOnPrimary,
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_BG[status] }]}>
      <Text style={[styles.text, { color: STATUS_TEXT[status] }]}>{STATUS_LABEL[status].toUpperCase()}</Text>
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
  text: { ...typography.mono, fontSize: 10 },
});
