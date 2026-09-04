import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Switch } from 'react-native';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { Button } from '../../../src/components/Button';
import { colors, radius, spacing, typography } from '../../../src/theme';
import { useAppAlert } from '../../../src/context/AlertContext';
import {
  watchAllServices,
  addService,
  updateService,
  updateServicePrice,
  deleteService,
  seedDefaultServicesIfEmpty,
} from '../../../src/api/services';
import type { ServiceType } from '../../../src/types';

export default function ServicesSettingsScreen() {
  const { alert } = useAppAlert();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    seedDefaultServicesIfEmpty();
    return watchAllServices(setServices);
  }, []);

  const handleAdd = async () => {
    const price = parseInt(newPrice, 10);
    if (newName.trim().length < 2 || !price) {
      alert('Nedostaju podaci', 'Unesi naziv usluge i ispravnu cenu.');
      return;
    }
    try {
      await addService(newName.trim(), price);
      setNewName('');
      setNewPrice('');
    } catch {
      alert('Greška', 'Usluga nije dodata. Pokušaj ponovo.');
    }
  };

  const handleSavePrice = async (id: string) => {
    const draft = priceDrafts[id];
    const price = parseInt(draft, 10);
    if (!price) {
      alert('Neispravna cena', 'Unesi ispravnu cenu.');
      return;
    }
    try {
      await updateServicePrice(id, price);
      setPriceDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      alert('Greška', 'Cena nije sačuvana. Pokušaj ponovo.');
    }
  };

  const handleToggleActive = (id: string, val: boolean) =>
    updateService(id, { active: val }).catch(() => alert('Greška', 'Izmena nije sačuvana. Pokušaj ponovo.'));

  const handleDelete = (id: string) => deleteService(id).catch(() => alert('Greška', 'Usluga nije obrisana. Pokušaj ponovo.'));

  return (
    <ScreenContainer showBack>
      <ScreenHeader eyebrow="Salon" title="Usluge i cenovnik" />

      <FlatList
        style={{ flex: 1 }}
        data={services}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={[styles.name, !item.active && styles.inactive]}>{item.name}</Text>
              <Switch
                value={item.active}
                onValueChange={(val) => handleToggleActive(item.id, val)}
                trackColor={{ true: colors.secondary, false: colors.border }}
              />
            </View>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                keyboardType="number-pad"
                value={priceDrafts[item.id] ?? String(item.price)}
                onChangeText={(t) => setPriceDrafts((prev) => ({ ...prev, [item.id]: t }))}
              />
              <Text style={styles.rsd}>RSD</Text>
              <Button title="Sačuvaj" variant="secondary" onPress={() => handleSavePrice(item.id)} />
            </View>
            <Button title="Obriši uslugu" variant="outline" onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />

      <View style={styles.addCard}>
        <Text style={styles.addTitle}>Dodaj novu uslugu</Text>
        <TextInput
          style={styles.input}
          placeholder="Naziv usluge"
          placeholderTextColor={colors.textSecondary}
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="Cena (RSD)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          value={newPrice}
          onChangeText={setNewPrice}
        />
        <Button title="Dodaj" onPress={handleAdd} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  inactive: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    width: 90,
    color: colors.textPrimary,
    backgroundColor: colors.inputBg,
  },
  rsd: { color: colors.textSecondary, ...typography.small },
  addCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  addTitle: { ...typography.bodyBold, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
  },
});
