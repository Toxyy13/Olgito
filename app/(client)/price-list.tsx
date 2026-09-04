import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { GlassCard } from '../../src/components/GlassCard';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import { colors, radius, spacing, typography } from '../../src/theme';
import { watchActiveServices } from '../../src/api/services';
import type { ServiceType } from '../../src/types';

export default function PriceListScreen() {
  const [services, setServices] = useState<ServiceType[]>([]);

  useEffect(() => watchActiveServices(setServices), []);

  return (
    <ScreenContainer scroll>
      <GlassCard>
        <EyebrowLabel>Cenovnik</EyebrowLabel>
        <Text style={styles.title}>Cene usluga</Text>
        <Text style={styles.description}>Cene važe po osobi. Za duže tretmane frizer najavi trajanje pre početka.</Text>

        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Usluge</Text>
          <Text style={styles.headerCount}>{services.length} usluga</Text>
        </View>

        <FlatList
          data={services}
          keyExtractor={(s) => s.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: spacing.sm, marginTop: spacing.sm }}
          ListEmptyComponent={<Text style={styles.empty}>Trenutno nema aktivnih usluga.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price} RSD</Text>
            </View>
          )}
        />
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, fontSize: 26, color: colors.textPrimary, marginTop: spacing.xs },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  headerLabel: { ...typography.h3, color: colors.textPrimary },
  headerCount: { ...typography.mono, fontSize: 11, color: colors.textSecondary, marginLeft: 'auto' },
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center', paddingVertical: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  price: { ...typography.mono, fontSize: 14, fontFamily: typography.monoBold.fontFamily, color: colors.accent },
});
