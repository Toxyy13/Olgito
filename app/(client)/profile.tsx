import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { Button } from '../../src/components/Button';
import { ClientChat } from '../../src/components/ClientChat';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const { appUser, logout } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  if (!appUser) return null;

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        {appUser.photoURL ? (
          <Image source={{ uri: appUser.photoURL }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoInitial}>{appUser.fullName.charAt(0) || '?'}</Text>
          </View>
        )}
        <Text style={styles.name}>{appUser.fullName}</Text>
        <Text style={styles.phone}>{appUser.phone}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Broj godina" value={String(appUser.age ?? '-')} />
        <Row label="Status naloga" value={appUser.accountStatus === 'approved' ? 'Odobren' : appUser.accountStatus} />
      </View>

      <Button title="Poruke od Olgice" onPress={() => setChatOpen(true)} />
      <View style={{ height: spacing.sm }} />
      <Button title="Odjavi se" variant="outline" onPress={logout} />

      <ClientChat clientId={chatOpen ? appUser.uid : null} title="Poruke sa Olgicom" onClose={() => setChatOpen(false)} />
    </ScreenContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.md },
  photo: { width: 88, height: 88, borderRadius: 44, marginBottom: spacing.sm },
  photoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  photoInitial: { color: colors.textOnPrimary, fontSize: 32, fontWeight: '800' },
  name: { ...typography.h3, color: colors.textPrimary },
  phone: { color: colors.textSecondary, ...typography.small },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: colors.textSecondary, ...typography.body },
  rowValue: { color: colors.textPrimary, ...typography.bodyBold },
});
