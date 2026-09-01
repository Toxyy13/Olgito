import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

export interface SideMenuItem {
  name: string; // ime fajla rute (npr. "calendar") — koristi se i za navigaciju i za prepoznavanje trenutne stranice
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  badge?: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  groupPath: string; // npr. "/(client)" ili "/(admin)"
  items: SideMenuItem[];
}

export function SideMenu({ visible, onClose, groupPath, items }: Props) {
  const router = useRouter();
  const segments = useSegments();
  const currentName = segments[segments.length - 1];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={() => {}}>
          <Text style={styles.brand}>Olgito 💈</Text>
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {items.map((item) => {
              const active = item.name === currentName;
              return (
                <Pressable
                  key={item.name}
                  style={[styles.item, active && styles.itemActive]}
                  onPress={() => {
                    onClose();
                    router.replace(`${groupPath}/${item.name}` as any);
                  }}
                >
                  <Ionicons name={item.icon} size={22} color={colors.textOnPrimary} />
                  <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{item.label}</Text>
                  {!!item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {active && <Ionicons name="ellipse" size={8} color={colors.textOnPrimary} style={{ marginLeft: spacing.xs }} />}
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textOnPrimary} />
            <Text style={styles.closeText}>Zatvori</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Providna tamnozelena pozadina — stranica ispod menija ostaje malo vidljiva.
  overlay: { flex: 1, backgroundColor: 'rgba(11,110,79,0.93)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  content: { width: '100%', maxWidth: 420, maxHeight: '85%' },
  brand: { ...typography.h1, color: colors.textOnPrimary, textAlign: 'center', marginBottom: spacing.lg },
  list: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  itemActive: { backgroundColor: colors.primary },
  itemLabel: { ...typography.bodyBold, color: colors.textOnPrimary, flex: 1 },
  itemLabelActive: { fontWeight: '800' },
  badge: {
    backgroundColor: colors.statusOtkazano,
    borderRadius: radius.pill,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: { color: colors.textOnPrimary, fontSize: 12, fontWeight: '800' },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  closeText: { ...typography.bodyBold, color: colors.textOnPrimary },
});
