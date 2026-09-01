import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, spacing, typography } from '../../src/theme';

export default function BlockedScreen() {
  const { logout, appUser } = useAuth();
  const isRejected = appUser?.accountStatus === 'rejected';

  return (
    <ScreenContainer scroll>
      <View style={styles.center}>
        <Text style={styles.emoji}>🚫</Text>
        <Text style={styles.title}>{isRejected ? 'Zahtev za nalog nije odobren' : 'Nalog je blokiran'}</Text>
        <Text style={styles.subtitle}>
          {isRejected
            ? 'Olgica nije odobrila tvoj zahtev za nalog. Ako misliš da je ovo greška, kontaktiraj je direktno.'
            : 'Korišćenje aplikacije ti je trenutno onemogućeno. Ako misliš da je ovo greška, kontaktiraj Olgicu direktno.'}
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
