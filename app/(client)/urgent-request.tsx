import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { createUrgentRequest } from '../../src/api/urgentRequests';

export default function UrgentRequestScreen() {
  const { appUser } = useAuth();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!appUser || note.trim().length < 5) {
      Alert.alert('Nedostaje opis', 'Napiši kratko kada bi ti termin bio potreban.');
      return;
    }
    setLoading(true);
    try {
      await createUrgentRequest({
        clientId: appUser.uid,
        clientName: appUser.fullName,
        clientPhone: appUser.phone,
        note: note.trim(),
      });
      setNote('');
      Alert.alert('Zahtev poslat', 'Olgica je obaveštena i javiće ti se čim bude mogla da ti pronađe termin.');
    } catch {
      Alert.alert('Greška', 'Nešto nije u redu. Pokušaj ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Hitan zahtev 🚨</Text>
      <Text style={styles.subtitle}>
        Ako ti nijedan slobodan termin ne odgovara, javi Olgici kada bi ti termin bio potreban — potrudiće se da ti
        izađe u susret.
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Kada bi ti termin bio potreban i zašto</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Npr. treba mi termin danas posle 18h, imam važan događaj sutra..."
          placeholderTextColor={colors.textSecondary}
        />
        <Button title="Pošalji zahtev" onPress={handleSubmit} loading={loading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.sm },
  subtitle: { color: colors.textSecondary, ...typography.body, marginTop: spacing.xs, marginBottom: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, gap: spacing.md },
  label: { ...typography.bodyBold, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 100,
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
});
