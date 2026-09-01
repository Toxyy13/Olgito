import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Linking } from 'react-native';
import * as Application from 'expo-application';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';
import { useAppAlert } from '../context/AlertContext';
import { getLatestAppVersion } from '../api/appVersion';

export function UpdateChecker() {
  const { alert } = useAppAlert();
  const [checking, setChecking] = useState(false);

  const currentVersionName = Application.nativeApplicationVersion ?? '—';

  const handleCheck = async () => {
    if (Platform.OS === 'web') {
      alert('Nije dostupno', 'Provera ažuriranja radi samo u instaliranoj aplikaciji na telefonu.');
      return;
    }
    setChecking(true);
    try {
      const latest = await getLatestAppVersion();
      if (!latest) {
        alert('Nema podataka', 'Verzija još nije objavljena.');
        return;
      }
      const installedCode = Number(Application.nativeBuildVersion ?? 0);
      if (latest.versionCode > installedCode) {
        alert(
          'Dostupna nova verzija',
          `Verzija ${latest.versionName} je dostupna${latest.releaseNotes ? `:\n${latest.releaseNotes}` : '.'}`,
          [
            { text: 'Kasnije', style: 'cancel' },
            { text: 'Preuzmi', onPress: () => Linking.openURL(latest.apkUrl) },
          ]
        );
      } else {
        alert('Ažurno', 'Imaš najnoviju verziju aplikacije.');
      }
    } catch {
      alert('Greška', 'Provera nije uspela. Proveri internet konekciju.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Verzija aplikacije</Text>
      <Text style={styles.value}>{currentVersionName}</Text>
      <Button title="Proveri ažuriranja" variant="secondary" onPress={handleCheck} loading={checking} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  label: { color: colors.textSecondary, ...typography.small },
  value: { ...typography.bodyBold, color: colors.textPrimary },
});
