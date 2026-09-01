import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, radius, spacing, typography } from '../../src/theme';
import { watchActiveServices } from '../../src/firebase/services';
import type { ServiceType } from '../../src/types';

export default function PriceListScreen() {
  const [services, setServices] = useState<ServiceType[]>([]);

  useEffect(() => watchActiveServices(setServices), []);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Cenovnik 💸</Text>
      <FlatList
        data={services}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
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
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
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
  price: { ...typography.bodyBold, color: colors.primary },
});
