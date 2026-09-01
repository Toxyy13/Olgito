import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { watchActiveServices } from '../../src/api/services';
import type { ServiceType } from '../../src/types';

export default function PriceListScreen() {
  const [services, setServices] = useState<ServiceType[]>([]);

  useEffect(() => watchActiveServices(setServices), []);

  return (
    <ScreenContainer>
      <ScreenHeader title="Cenovnik 💸" />
      <FlatList
        style={{ flex: 1 }}
        data={services}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.sm, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price} RSD</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  price: { ...typography.bodyBold, color: colors.textOnPrimary },
});
