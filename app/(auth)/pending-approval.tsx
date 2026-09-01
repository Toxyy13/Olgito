import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, spacing, typography } from '../../src/theme';

export default function PendingApprovalScreen() {
  const { logout } = useAuth();
  return (
    <ScreenContainer scroll>
      <View style={styles.center}>
        <Text style={styles.emoji}>⏳</Text>
        <Text style={styles.title}>Tvoj nalog čeka odobrenje</Text>
        <Text style={styles.subtitle}>
          Olgica treba da odobri tvoj nalog pre nego što budeš mogao/la da zakazuješ termine. Javićemo ti se čim se to
          desi.
        </Text>
        <Button title="Odjavi se" variant="outline" onPress={logout} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emoji: { fontSize: 56 },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
});
